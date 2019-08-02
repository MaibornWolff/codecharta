package de.maibornwolff.codecharta.importer.sourcecodeparser.sonaranalyzers

import de.maibornwolff.codecharta.importer.sourcecodeparser.NullFileLinesContextFactory
import de.maibornwolff.codecharta.importer.sourcecodeparser.metrics.ProjectMetrics
import de.maibornwolff.codecharta.importer.sourcecodeparser.visitors.MaxNestingLevelVisitor
import org.sonar.api.SonarQubeSide
import org.sonar.api.batch.fs.InputFile
import org.sonar.api.batch.fs.internal.TestInputFileBuilder
import org.sonar.api.batch.rule.CheckFactory
import org.sonar.api.batch.rule.internal.ActiveRulesBuilder
import org.sonar.api.batch.sensor.internal.SensorContextTester
import org.sonar.api.config.internal.MapSettings
import org.sonar.api.internal.SonarRuntimeImpl
import org.sonar.api.issue.NoSonarFilter
import org.sonar.api.rule.RuleKey
import org.sonar.api.server.profile.BuiltInQualityProfilesDefinition
import org.sonar.api.server.rule.RulesDefinition
import org.sonar.api.utils.Version
import org.sonar.java.DefaultJavaResourceLocator
import org.sonar.java.JavaClasspath
import org.sonar.java.JavaTestClasspath
import org.sonar.java.SonarComponents
import org.sonar.java.ast.parser.JavaParser
import org.sonar.java.checks.CheckList
import org.sonar.java.model.DefaultJavaFileScannerContext
import org.sonar.java.model.JavaVersionImpl
import org.sonar.plugins.java.Java
import org.sonar.plugins.java.JavaRulesDefinition
import org.sonar.plugins.java.JavaSonarWayProfile
import org.sonar.plugins.java.JavaSquidSensor
import org.sonar.plugins.java.api.tree.CompilationUnitTree
import org.sonar.plugins.java.api.tree.Tree
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.PrintStream
import java.nio.charset.StandardCharsets

class JavaSonarAnalyzer(verbose: Boolean = false, searchIssues: Boolean = true) : SonarAnalyzer(verbose, searchIssues) {

    override val FILE_EXTENSION = "java"
    override lateinit var baseDir: File
    val MAX_FILE_NAME_PRINT_LENGTH = 30

    private val SONAR_VERSION_MAJOR = 7
    private val SONAR_VERSION_MINOR = 3

    private lateinit var javaClasspath: JavaClasspath
    private lateinit var sonarComponents: SonarComponents

    private var activeRules = ActiveRulesBuilder().build()
    private var mapSettings = MapSettings().asConfig()
    private lateinit var issueRepository: RulesDefinition.Repository

    private var totalFiles = 0
    private var analyzedFiles = 0
    private val originalOut = System.out

    init {
        if (searchIssues) {
            setActiveRules()
            createIssueRepository()
        }
    }

    private fun createIssueRepository() {
        val sonarRuntime = SonarRuntimeImpl.forSonarQube(Version.create(SONAR_VERSION_MAJOR, SONAR_VERSION_MINOR), SonarQubeSide.SERVER)
        val definition = JavaRulesDefinition(mapSettings, sonarRuntime)
        val context = RulesDefinition.Context()
        definition.define(context)
        issueRepository = context.repository("squid")!!
    }

    private fun setActiveRules() {
        val sonarRuntime = SonarRuntimeImpl.forSonarQube(Version.create(SONAR_VERSION_MAJOR, SONAR_VERSION_MINOR), SonarQubeSide.SERVER)
        val profileDef = JavaSonarWayProfile(sonarRuntime)
        val context = BuiltInQualityProfilesDefinition.Context()
        profileDef.define(context)
        val rules = context.profile("java", "Sonar way").rules()

        val activeRulesBuilder = ActiveRulesBuilder()
        rules.forEach { activeRulesBuilder.create(RuleKey.of(CheckList.REPOSITORY_KEY, it.ruleKey())).activate() }
        activeRules = activeRulesBuilder.build()
    }

    override fun createContext() {
        sensorContext = SensorContextTester.create(baseDir)
        sensorContext.setRuntime(SonarRuntimeImpl.forSonarQube(Version.create(SONAR_VERSION_MAJOR, SONAR_VERSION_MINOR), SonarQubeSide.SERVER))
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
            executeScan()
            val fileMetrics = retrieveMetrics(file)
            retrieveAdditionalMetrics(file).forEach { fileMetrics.add(it.key, it.value) }
            retrieveIssues().forEach { fileMetrics.add(it.key, it.value) }
            projectMetrics.addFileMetricMap(file, fileMetrics)
        }

        System.setOut(originalOut)
        return projectMetrics
    }

    override fun buildSonarComponents() {
        val checkFactory = CheckFactory(this.activeRules)
        val javaTestClasspath = JavaTestClasspath(mapSettings, sensorContext.fileSystem())
        val fileLinesContextFactory = NullFileLinesContextFactory()
        sonarComponents = SonarComponents(
                fileLinesContextFactory,
                sensorContext.fileSystem(),
                javaClasspath,
                javaTestClasspath,
                checkFactory
        )
        sonarComponents.setSensorContext(this.sensorContext)
    }


    override fun addFileToContext(fileName: String) {
        sensorContext.fileSystem().add(getInputFile(fileName))
    }

    private fun getInputFile(fileName: String) : InputFile {
        return TestInputFileBuilder.create("moduleKey", fileName)
                .setModuleBaseDir(baseDir.toPath())
                .setCharset(StandardCharsets.UTF_8)
                .setType(InputFile.Type.MAIN)
                .setLanguage(Java.KEY)
                .initMetadata(fileContent(File("$baseDir/$fileName"), StandardCharsets.UTF_8))
                .build()
    }

    override fun executeScan() {
        val javaSquidSensor = JavaSquidSensor(
                sonarComponents,
                sensorContext.fileSystem(),
                DefaultJavaResourceLocator(javaClasspath),
                mapSettings,
                NoSonarFilter()
        )
        javaSquidSensor.execute(sensorContext)
    }

    private fun retrieveIssues(): HashMap<String, Int> {
        val issues: HashMap<String, Int> = hashMapOf(
                "bug" to 0,
                "vulnerability" to 0,
                "code_smell" to 0,
                "security_hotspot" to 0,
                "sonar_issue_other" to 0
        )

        sensorContext.allIssues().forEach {
            val ruleKey = it.ruleKey().rule()
            val type = issueRepository.rule(ruleKey)?.type().toString().toLowerCase()
            println("Found: $type ${it.ruleKey().rule()} \n with message ${it.primaryLocation().message()}")
            if (issues.containsKey(type)) {
                issues[type] = issues[type]!! + 1
            } else {
                issues["sonar_issue_other"] = issues["sonar_issue_other"]!! + 1
            }
        }
        return issues
    }

    private fun retrieveAdditionalMetrics(fileName: String): HashMap<String, Int> {
        val additionalMetrics: HashMap<String, Int> = hashMapOf()

        val tree = buildTree(fileName)

        val commentedOutBlocks = sensorContext.allIssues().filter { it.ruleKey().rule() == "CommentedOutCodeLine" }
        additionalMetrics["commented_out_code_blocks"] = commentedOutBlocks.size
        addMetricsFromVisitors(tree, additionalMetrics)

        return additionalMetrics
    }

    private fun buildTree(fileName: String): Tree {
        val compilationUnitTree = JavaParser.createParser().parse(File("$baseDir/$fileName")) as CompilationUnitTree
        val defaultJavaFileScannerContext = DefaultJavaFileScannerContext(
                compilationUnitTree, getInputFile(fileName), null, null, JavaVersionImpl(), true)

        return defaultJavaFileScannerContext.tree
    }

    private fun addMetricsFromVisitors(tree: Tree, additionalMetrics: HashMap<String, Int>) {
        additionalMetrics["max_nesting_level"] = MaxNestingLevelVisitor().getMaxNestingLevel(tree)
    }

    private fun printProgressBar(fileName: String) {
        analyzedFiles += 1
        val percentage = analyzedFiles.toFloat() / totalFiles * 100
        val roundedPercentage = String.format("%.1f", percentage)
        val currentFile = if (fileName.length > MAX_FILE_NAME_PRINT_LENGTH) ".." + fileName.takeLast(MAX_FILE_NAME_PRINT_LENGTH) else fileName
        val message = "\r Analyzing .java files... $roundedPercentage% ($currentFile)"

        System.setOut(originalOut)
        print(message)

        if (!verbose) System.setOut(PrintStream(ByteArrayOutputStream()))
    }
}
