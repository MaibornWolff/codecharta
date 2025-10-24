package de.maibornwolff.codecharta.analysers.parsers.rawtext

import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserDialogInterface
import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserInterface
import de.maibornwolff.codecharta.analysers.analyserinterface.CommonAnalyserParameters
import de.maibornwolff.codecharta.analysers.analyserinterface.util.CommaSeparatedParameterPreprocessor
import de.maibornwolff.codecharta.analysers.analyserinterface.util.CommaSeparatedStringToListConverter
import de.maibornwolff.codecharta.model.AttributeDescriptor
import de.maibornwolff.codecharta.model.AttributeGenerator
import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import de.maibornwolff.codecharta.serialization.ProjectSerializer
import de.maibornwolff.codecharta.util.CodeChartaConstants
import de.maibornwolff.codecharta.util.InputHelper
import de.maibornwolff.codecharta.util.Logger
import picocli.CommandLine
import java.io.File
import java.io.IOException
import java.io.InputStream
import java.io.PrintStream

@CommandLine.Command(
    name = RawTextParser.NAME,
    description = [RawTextParser.DESCRIPTION],
    footer = [CodeChartaConstants.GENERIC_FOOTER]
)
class RawTextParser(
    private val input: InputStream = System.`in`,
    private val output: PrintStream = System.out,
    private val error: PrintStream = System.err
) : AnalyserInterface, AttributeGenerator, CommonAnalyserParameters() {
    @CommandLine.Option(
        names = ["-m", "--metrics"],
        description = [
            "comma-separated list of metrics to be computed (all available metrics are computed if not specified) " +
                "(when using powershell, the list either can't contain spaces or has to be in quotes)"
        ],
        paramLabel = "metrics",
        converter = [(CommaSeparatedStringToListConverter::class)],
        preprocessor = CommaSeparatedParameterPreprocessor::class
    )
    private var metricNames: List<String> = listOf()

    @CommandLine.Option(names = ["--tab-width"], description = ["tab width used (estimated if not provided)"])
    private var tabWidth: Int = DEFAULT_TAB_WIDTH

    @CommandLine.Option(names = ["--max-indentation-level"], description = ["maximum Indentation Level (default 10)"])
    private var maxIndentLvl: Int = DEFAULT_INDENT_LVL

    @CommandLine.Option(
        names = ["--without-default-excludes"],
        description = [
            "DEPRECATION WARNING: this flag will soon be disabled and has been replaced by '--include-build-folders'" +
                "include build, target, dist, resources and out folders as well as files/folders starting with '.' "
        ]
    )
    private var withoutDefaultExcludes = false

    override val name = NAME
    override val description = DESCRIPTION

    companion object {
        const val NAME = "rawtextparser"
        const val DESCRIPTION = "generates cc.json from projects or source code files"

        const val DEFAULT_INDENT_LVL = 10
        const val DEFAULT_TAB_WIDTH = -1
        private val DEFAULT_EXCLUDES = arrayOf("/out/", "/build/", "/target/", "/dist/", "/resources/", "/\\..*")
    }

    @Throws(IOException::class)
    override fun call(): Unit? {
        logExecutionStartedSyncSignal()

        val inputFile = inputFiles.firstOrNull()
        require(InputHelper.isInputValidAndNotNull(arrayOf(inputFile), canInputContainFolders = true)) {
            "Input invalid file for RawTextParser, stopping execution..."
        }

        val useGitignore = !bypassGitignore
        val effectivePatternsToExclude = determineExclusionPatterns(inputFile!!, useGitignore)

        val baseFileNodeMap = loadBaseFileNodes()
        val projectMetricsCollector =
            ProjectMetricsCollector(
                inputFile,
                effectivePatternsToExclude,
                fileExtensionsToAnalyse,
                metricNames,
                verbose,
                maxIndentLvl,
                tabWidth,
                baseFileNodeMap,
                useGitignore
            )
        val projectMetrics: ProjectMetrics = projectMetricsCollector.parseProject()
        println()

        reportNotFoundFileExtensions(projectMetrics)
        reportInvalidMetrics(projectMetrics)
        reportGitignoreStatistics(projectMetricsCollector)

        if (projectMetrics.isEmpty()) {
            println()
            Logger.error { "No files with specified file extension(s) were found within the given folder - not generating an output file!" }
            return null
        }

        val pipedProject = ProjectDeserializer.deserializeProject(input)
        val project = ProjectGenerator().generate(projectMetrics, maxIndentLvl, pipedProject)

        ProjectSerializer.serializeToFileOrStream(project, outputFile, output, compress)

        return null
    }

    private fun determineExclusionPatterns(inputFile: File, useGitignore: Boolean): List<String> {
        val excludePatterns = specifiedExcludePatterns.toMutableList()
        val rootGitignoreExists = File(inputFile, ".gitignore").exists()

        if (useGitignore && !rootGitignoreExists) {
            Logger.warn { "No .gitignore found at root level, excluding common build folders as fallback..." }
        }

        if (!includeBuildFolders && !rootGitignoreExists) {
            excludePatterns.addAll(DEFAULT_EXCLUDES)
        }

        return excludePatterns
    }

    private fun reportNotFoundFileExtensions(projectMetrics: ProjectMetrics) {
        val notFoundFileExtensions = mutableListOf<String>()
        for (fileExtension in fileExtensionsToAnalyse) {
            var isFileExtensionIncluded = false
            for (relativeFileName in projectMetrics.metricsMap.keys) {
                if (relativeFileName.contains(fileExtension)) {
                    isFileExtensionIncluded = true
                }
            }
            if (!isFileExtensionIncluded) {
                notFoundFileExtensions.add(fileExtension)
            }
        }
        if (notFoundFileExtensions.isNotEmpty()) {
            println()
            notFoundFileExtensions.forEach { Logger.warn { "The specified file extension '$it' was not found within the given folder!" } }
        }
    }

    private fun reportInvalidMetrics(projectMetrics: ProjectMetrics) {
        for (metricName in metricNames) {
            if (!projectMetrics.hasMetric(metricName)) {
                Logger.warn { "Metric $metricName is invalid and not included in the output" }
            }
        }
    }

    private fun reportGitignoreStatistics(projectMetricsCollector: ProjectMetricsCollector) {
        val (gitignoreExcludedCount, gitignoreFiles) = projectMetricsCollector.getGitIgnoreStatistics()
        if (!bypassGitignore && gitignoreExcludedCount > 0) {
            Logger.info { "$gitignoreExcludedCount files were excluded by .gitignore rules" }
            if (verbose && gitignoreFiles.isNotEmpty()) {
                System.err.println("Found .gitignore files at:")
                gitignoreFiles.forEach { System.err.println("  - $it") }
            }
        }
    }

    override fun getDialog(): AnalyserDialogInterface = Dialog

    override fun isApplicable(resourceToBeParsed: String): Boolean {
        println("Checking if RawTextParser is applicable...")

        if (resourceToBeParsed == "") {
            return false
        }

        val searchFile = File(resourceToBeParsed.trim())
        if (searchFile.isFile) {
            return true
        }

        if (!searchFile.isDirectory) {
            return false
        }

        val fileSearch = searchFile.walk()
        return fileSearch.asSequence()
            .filter { it.isFile }
            .any()
    }

    override fun getAttributeDescriptorMaps(): Map<String, AttributeDescriptor> {
        return getAttributeDescriptors(10)
    }
}
