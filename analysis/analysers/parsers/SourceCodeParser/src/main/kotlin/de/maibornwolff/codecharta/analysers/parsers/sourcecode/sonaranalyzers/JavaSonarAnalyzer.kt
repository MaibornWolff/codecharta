package de.maibornwolff.codecharta.analysers.parsers.sourcecode.sonaranalyzers

import com.sonar.sslr.api.RecognitionException
import de.maibornwolff.codecharta.analysers.parsers.sourcecode.NullFileLinesContextFactory
import de.maibornwolff.codecharta.analysers.parsers.sourcecode.metrics.ProjectMetrics
import de.maibornwolff.codecharta.analysers.parsers.sourcecode.visitors.MaxNestingLevelVisitor
import de.maibornwolff.codecharta.progresstracker.ParsingUnit
import de.maibornwolff.codecharta.progresstracker.ProgressTracker
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking
import org.sonar.api.SonarEdition
import org.sonar.api.SonarQubeSide
import org.sonar.api.batch.fs.InputFile
import org.sonar.api.batch.fs.internal.TestInputFileBuilder
import org.sonar.api.batch.rule.CheckFactory
import org.sonar.api.batch.rule.internal.ActiveRulesBuilder
import org.sonar.api.batch.rule.internal.NewActiveRule
import org.sonar.api.batch.sensor.internal.SensorContextTester
import org.sonar.api.config.internal.MapSettings
import org.sonar.api.internal.SonarRuntimeImpl
import org.sonar.api.issue.NoSonarFilter
import org.sonar.api.rule.RuleKey
import org.sonar.api.server.profile.BuiltInQualityProfilesDefinition
import org.sonar.api.server.rule.RulesDefinition
import org.sonar.api.utils.Version
import org.sonar.java.AnalysisException
import org.sonar.java.DefaultJavaResourceLocator
import org.sonar.java.JavaClasspath
import org.sonar.java.JavaTestClasspath
import org.sonar.java.SonarComponents
import org.sonar.java.checks.CheckList
import org.sonar.java.filters.PostAnalysisIssueFilter
import org.sonar.java.model.DefaultJavaFileScannerContext
import org.sonar.java.model.JParser
import org.sonar.java.model.JavaVersionImpl
import org.sonar.plugins.java.Java
import org.sonar.plugins.java.JavaRulesDefinition
import org.sonar.plugins.java.JavaSonarWayProfile
import org.sonar.plugins.java.JavaSquidSensor
import org.sonar.plugins.java.api.tree.Tree
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.PrintStream
import java.nio.charset.StandardCharsets
import java.util.Locale

class JavaSonarAnalyzer(verbose: Boolean = false, searchIssues: Boolean = true) : SonarAnalyzer(verbose, searchIssues) {
    override lateinit var baseDir: File
    override val fileExtension = "java"

    private lateinit var javaClasspath: JavaClasspath
    private lateinit var sonarComponents: SonarComponents

    private var activeRules = ActiveRulesBuilder().build()
    private var mapSettings = MapSettings().asConfig()
    private lateinit var issueRepository: RulesDefinition.Repository

    private var totalFiles = 0
    private var analyzedFiles = 0
    private val originalOut = System.out
    private val parsingUnit = ParsingUnit.Files
    private val progressTracker: ProgressTracker = ProgressTracker()

    companion object {
        private const val MAX_FILE_NAME_PRINT_LENGTH = 30
        private const val COMMENTED_OUT_CODE_BLOCKS_RULE_KEY = "S125"
        private const val SONAR_VERSION_MAJOR = 8
        private const val SONAR_VERSION_MINOR = 4
    }

    init {
        if (searchIssues) {
            setActiveRules()
            createIssueRepository()
        }
    }

    private fun createIssueRepository() {
        val definition = JavaRulesDefinition(mapSettings)
        val context = RulesDefinition.Context()
        definition.define(context)
        issueRepository = context.repository("java")!!
    }

    private fun setActiveRules() {
        val profileDef = JavaSonarWayProfile()
        val context = BuiltInQualityProfilesDefinition.Context()
        profileDef.define(context)
        val rules = context.profile("java", "Sonar way").rules()

        val activeRulesBuilder = ActiveRulesBuilder()
        rules.forEach {
            val activeRule =
                NewActiveRule.Builder().setRuleKey(RuleKey.of(CheckList.REPOSITORY_KEY, it.ruleKey())).build()
            activeRulesBuilder.addRule(activeRule)
        }
        activeRules = activeRulesBuilder.build()
    }

    override fun createContext() {
        sensorContext = SensorContextTester.create(baseDir)
        sensorContext.setRuntime(
            SonarRuntimeImpl.forSonarQube(
                Version.create(
                    SONAR_VERSION_MAJOR,
                    SONAR_VERSION_MINOR
                ),
                SonarQubeSide.SERVER,
                SonarEdition.COMMUNITY
            )
        )
        javaClasspath = JavaClasspath(mapSettings, sensorContext.fileSystem())
    }

    override fun scanFiles(fileList: List<String>, root: File): ProjectMetrics {
        baseDir = root.absoluteFile
        val projectMetrics = ProjectMetrics()

        analyzedFiles = 0
        totalFiles = fileList.size
        for (file in fileList) {
            printProgressBar(file)
            createContext()
            buildSonarComponents()
            addFileToContext(file)

            try {
                executeScan()
            } catch (e: AnalysisException) {
                System.err.println("Sonar AnalysisException while analyzing $file. File was therefore skipped.")
                e.printStackTrace()
                continue
            }

            val fileMetrics = retrieveMetrics(file)

            runBlocking(Dispatchers.Default) {
                retrieveAdditionalMetrics(file).forEach { launch { fileMetrics.add(it.key, it.value) } }
                if (searchIssues) retrieveIssues().forEach { launch { fileMetrics.add(it.key, it.value) } }
                projectMetrics.addFileMetricMap(file, fileMetrics)
            }
            projectMetrics.addFileMetricMap(file, fileMetrics)
        }
        System.setOut(originalOut)
        return projectMetrics
    }

    override fun buildSonarComponents() {
        val checkFactory = CheckFactory(this.activeRules)
        val javaTestClasspath = JavaTestClasspath(mapSettings, sensorContext.fileSystem())
        sonarComponents =
            SonarComponents(
                NullFileLinesContextFactory(),
                sensorContext.fileSystem(),
                javaClasspath,
                javaTestClasspath,
                checkFactory,
                PostAnalysisIssueFilter()
            )
        sonarComponents.setSensorContext(this.sensorContext)
    }

    override fun addFileToContext(fileName: String) {
        sensorContext.fileSystem().add(getInputFile(fileName))
    }

    private fun getInputFile(fileName: String): InputFile {
        return TestInputFileBuilder.create("moduleKey", fileName)
            .setModuleBaseDir(baseDir.toPath())
            .setCharset(StandardCharsets.UTF_8)
            .setType(InputFile.Type.MAIN)
            .setLanguage(Java.KEY)
            .initMetadata(fileContent(File("$baseDir/$fileName"), StandardCharsets.UTF_8))
            .build()
    }

    override fun executeScan() {
        runBlocking {
            launch {
                val javaSquidSensor =
                    JavaSquidSensor(
                        sonarComponents,
                        sensorContext.fileSystem(),
                        DefaultJavaResourceLocator(javaClasspath),
                        mapSettings,
                        NoSonarFilter(),
                        PostAnalysisIssueFilter()
                    )
                javaSquidSensor.execute(sensorContext)
            }
        }
    }

    private fun retrieveIssues(): HashMap<String, Int> {
        val issues: HashMap<String, Int> =
            hashMapOf(
                "bug" to 0,
                "vulnerability" to 0,
                "code_smell" to 0,
                "security_hotspot" to 0,
                "sonar_issue_other" to 0
            )

        sensorContext.allIssues().forEach {
            val ruleKey = it.ruleKey().rule()
            val type = issueRepository.rule(ruleKey)?.type().toString().lowercase(Locale.getDefault())
            if (verbose) {
                System.err.println(
                    "Found: $type ${it.ruleKey().rule()} \n with message ${it.primaryLocation().message()}"
                )
            }
            if (issues.containsKey(type)) {
                issues[type] = issues.getValue(type) + 1
            } else {
                issues["sonar_issue_other"] = issues.getValue("sonar_issue_other") + 1
            }
        }
        return issues
    }

    private fun retrieveAdditionalMetrics(fileName: String): MutableMap<String, Int> {
        val additionalMetrics: MutableMap<String, Int> = mutableMapOf()

        val tree: Tree
        try {
            tree = buildTree(fileName)
        } catch (e: RecognitionException) {
            System.err.println("Syntax error in file $fileName, therefore some metrics are not calculated")
            return hashMapOf()
        }

        val commentedOutBlocks =
            sensorContext.allIssues().filter {
                it.ruleKey().rule() == COMMENTED_OUT_CODE_BLOCKS_RULE_KEY
            }
        additionalMetrics["commented_out_code_blocks"] = commentedOutBlocks.size
        addMetricsFromVisitors(tree, additionalMetrics)

        return additionalMetrics
    }

    private fun buildTree(fileName: String): Tree {
        val inputFile = getInputFile(fileName)
        // This enables the whole project to contain the binaries. It's a sneaky workaround to
        // not specify the folder, because it might be unknown. We could accept a CLI parameter
        // to handle this. Not doing so might result in a performance issue.
        val classPaths = listOf(File(""))

        val compilationUnitTree =
            JParser.parse(
                JParser.MAXIMUM_SUPPORTED_JAVA_VERSION,
                inputFile.filename(),
                inputFile.contents(),
                classPaths
            )
        val defaultJavaFileScannerContext =
            DefaultJavaFileScannerContext(
                compilationUnitTree,
                inputFile,
                null,
                null,
                JavaVersionImpl(),
                true
            )

        return defaultJavaFileScannerContext.tree
    }

    private fun addMetricsFromVisitors(tree: Tree, additionalMetrics: MutableMap<String, Int>) {
        additionalMetrics["max_nesting_level"] = MaxNestingLevelVisitor().getMaxNestingLevel(tree)
    }

    private fun printProgressBar(fileName: String) {
        analyzedFiles += 1
        val currentFile =
            if (fileName.length > MAX_FILE_NAME_PRINT_LENGTH) {
                ".." +
                    fileName.takeLast(
                        MAX_FILE_NAME_PRINT_LENGTH
                    )
            } else {
                fileName
            }
        progressTracker.updateProgress(totalFiles.toLong(), analyzedFiles.toLong(), parsingUnit.name, currentFile)

        if (!verbose) System.setOut(PrintStream(ByteArrayOutputStream()))
    }
}
