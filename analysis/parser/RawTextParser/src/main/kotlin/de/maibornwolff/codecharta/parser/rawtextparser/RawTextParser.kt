package de.maibornwolff.codecharta.parser.rawtextparser

import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import de.maibornwolff.codecharta.serialization.ProjectSerializer
import de.maibornwolff.codecharta.tools.interactiveparser.InteractiveParser
import de.maibornwolff.codecharta.tools.interactiveparser.ParserDialogInterface
import de.maibornwolff.codecharta.tools.interactiveparser.util.CodeChartaConstants
import de.maibornwolff.codecharta.util.CommaSeparatedStringToListConverter
import de.maibornwolff.codecharta.util.FileExtensionConverter
import de.maibornwolff.codecharta.util.InputHelper
import mu.KotlinLogging
import picocli.CommandLine
import java.io.File
import java.io.IOException
import java.io.InputStream
import java.io.PrintStream
import java.util.concurrent.Callable

@CommandLine.Command(
        name = RawTextParser.NAME,
        description = [RawTextParser.DESCRIPTION],
        footer = [CodeChartaConstants.General.GENERIC_FOOTER]
)
class RawTextParser(
    private val input: InputStream = System.`in`,
    private val output: PrintStream = System.out,
    private val error: PrintStream = System.err,
) : Callable<Void>, InteractiveParser {

    private val logger = KotlinLogging.logger {}

    private val DEFAULT_EXCLUDES = arrayOf("/out/", "/build/", "/target/", "/dist/", "/resources/", "/\\..*")

    @CommandLine.Option(names = ["-h", "--help"], usageHelp = true, description = ["displays this help and exits"])
    private var help = false

    @CommandLine.Option(names = ["--verbose"], description = ["verbose mode"])
    private var verbose = false

    @CommandLine.Parameters(arity = "1", paramLabel = "FILE or FOLDER", description = ["file/project to parseProject"])
    private var inputFile: File? = null

    @CommandLine.Option(
        arity = "0..",
        names = ["-m", "--metrics"],
        description = ["metrics to be computed (select all if not specified)"],
        paramLabel = "metrics",
        converter = [(CommaSeparatedStringToListConverter::class)]
    )
    private var metricNames: List<String> = listOf()

    @CommandLine.Option(names = ["-o", "--output-file"], description = ["output File (or empty for stdout)"])
    private var outputFile: String? = null

    @CommandLine.Option(names = ["-nc", "--not-compressed"], description = ["save uncompressed output File"])
    private var compress = true

    @CommandLine.Option(names = ["--tab-width"], description = ["tab width used (estimated if not provided)"])
    private var tabWidth: Int = DEFAULT_TAB_WIDTH

    @CommandLine.Option(names = ["--max-indentation-level"], description = ["maximum Indentation Level (default 10)"])
    private var maxIndentLvl: Int = DEFAULT_INDENT_LVL

    @CommandLine.Option(
            names = ["-e", "--exclude"],
            description = ["exclude file/folder according to regex pattern"],
            converter = [(CommaSeparatedStringToListConverter::class)])
    private var exclude: List<String> = listOf()

    @CommandLine.Option(
        names = ["-fe", "--file-extensions"],
        description = ["parseProject only files with specified extensions (default: any)"],
        converter = [(FileExtensionConverter::class)]
    )
    private var fileExtensions: List<String> = listOf()

    @CommandLine.Option(
        names = ["--without-default-excludes"],
        description = ["include build, target, dist, resources and out folders as well as files/folders starting with '.' "]
    )
    private var withoutDefaultExcludes = false

    override val name = NAME
    override val description = DESCRIPTION

    companion object {
        const val NAME = "rawtextparser"
        const val DESCRIPTION = "generates cc.json from projects or source code files"

        const val DEFAULT_INDENT_LVL = 10
        const val DEFAULT_TAB_WIDTH = -1
    }

    @Throws(IOException::class)
    override fun call(): Void? {
        print(" ")
        if (!InputHelper.isInputValidAndNotNull(arrayOf(inputFile), canInputContainFolders = true)) {
            throw IllegalArgumentException("Input invalid file for RawTextParser, stopping execution...")
        }

        if (!withoutDefaultExcludes) exclude += DEFAULT_EXCLUDES

        val projectMetrics: ProjectMetrics =
            ProjectMetricsCollector(inputFile!!, exclude, fileExtensions, metricNames, verbose, maxIndentLvl, tabWidth).parseProject()
        println()

        if (projectMetrics.metricsMap.isEmpty()) {
            println()
            logger.error("No files with specified file extension(s) were found within the given folder - not generating an output file!")
            return null
        }

        logWarningsForNotFoundFileExtensions(projectMetrics)
        logWarningsForInvalidMetrics(projectMetrics)

        val pipedProject = ProjectDeserializer.deserializeProject(input)
        val project = ProjectGenerator().generate(projectMetrics, pipedProject)

        ProjectSerializer.serializeToFileOrStream(project, outputFile, output, compress)

        return null
    }

    private fun logWarningsForNotFoundFileExtensions(projectMetrics: ProjectMetrics) {
        val notFoundFileExtensions = mutableListOf<String>()
        for (fileExtension in fileExtensions) {
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
            notFoundFileExtensions.forEach { logger.warn("The specified file extension '$it' was not found within the given folder!") }
        }
    }

    private fun logWarningsForInvalidMetrics(projectMetrics: ProjectMetrics) {
        for (metricName in metricNames) {
            if (metricName !in projectMetrics.metricsMap.values.map { it.metricsMap.keys }.flatten()) {
                logger.warn("Metric $metricName is invalid and not included in the output")
            }
        }
    }

    override fun getDialog(): ParserDialogInterface = ParserDialog
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
}
