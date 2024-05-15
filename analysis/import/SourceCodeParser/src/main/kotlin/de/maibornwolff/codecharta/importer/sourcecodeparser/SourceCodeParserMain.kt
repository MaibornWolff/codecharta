package de.maibornwolff.codecharta.importer.sourcecodeparser

import de.maibornwolff.codecharta.importer.sourcecodeparser.metricwriters.CSVMetricWriter
import de.maibornwolff.codecharta.importer.sourcecodeparser.metricwriters.JSONMetricWriter
import de.maibornwolff.codecharta.importer.sourcecodeparser.metricwriters.MetricWriter
import de.maibornwolff.codecharta.model.AttributeDescriptor
import de.maibornwolff.codecharta.model.AttributeGenerator
import de.maibornwolff.codecharta.serialization.FileExtension
import de.maibornwolff.codecharta.serialization.OutputFileHandler
import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import de.maibornwolff.codecharta.tools.interactiveparser.InteractiveParser
import de.maibornwolff.codecharta.tools.interactiveparser.ParserDialogInterface
import de.maibornwolff.codecharta.tools.interactiveparser.util.CodeChartaConstants
import de.maibornwolff.codecharta.tools.pipeableparser.PipeableParser
import de.maibornwolff.codecharta.tools.pipeableparser.PipeableParserSyncFlag
import de.maibornwolff.codecharta.util.CommaSeparatedParameterPreprocessor
import de.maibornwolff.codecharta.util.CommaSeparatedStringToListConverter
import de.maibornwolff.codecharta.util.InputHelper
import de.maibornwolff.codecharta.util.Logger
import de.maibornwolff.codecharta.util.ResourceSearchHelper
import picocli.CommandLine
import java.io.BufferedWriter
import java.io.File
import java.io.FileWriter
import java.io.IOException
import java.io.InputStream
import java.io.OutputStreamWriter
import java.io.PrintStream
import java.io.PrintWriter
import java.io.Writer
import java.util.concurrent.Callable

@CommandLine.Command(
    name = SourceCodeParserMain.NAME,
    description = [SourceCodeParserMain.DESCRIPTION],
    footer = [SourceCodeParserMain.FOOTER]
)
class SourceCodeParserMain(
    private val output: PrintStream,
    private val input: InputStream = System.`in`,
    private val error: PrintStream = System.err
) : Callable<Unit>, InteractiveParser, PipeableParser, AttributeGenerator {
    // we need this constructor because ccsh requires an empty constructor
    constructor() : this(System.out)

    @CommandLine.Option(names = ["-h", "--help"], usageHelp = true, description = ["displays this help and exits"])
    private var help = false

    @CommandLine.Option(names = ["-ni", "--no-issues"], description = ["do not search for sonar issues"])
    private var findNoIssues = false

    @CommandLine.Option(
        names = ["-e", "--exclude"],
        description = ["comma-separated list of regex patterns to exclude files/folders (when using powershell, the list either can't contain spaces or has to be in quotes)"],
        converter = [(CommaSeparatedStringToListConverter::class)],
        preprocessor = CommaSeparatedParameterPreprocessor::class
    )
    private var exclude: Array<String> = arrayOf()

    @CommandLine.Option(
        names = ["--default-excludes"],
        description = ["exclude build, target, dist and out folders as well as files/folders starting with '.' "]
    )
    private var defaultExcludes = false

    @CommandLine.Option(
        names = ["-f", "--format"],
        description = ["the format to output (either json or csv)"],
        converter = [(OutputTypeConverter::class)]
    )
    private var outputFormat = OutputFormat.JSON

    @CommandLine.Option(names = ["-o", "--output-file"], description = ["output File (or empty for stdout)"])
    private var outputFile: File? = null

    @CommandLine.Option(names = ["-nc", "--not-compressed"], description = ["save uncompressed output File"])
    private var compress = true

    @CommandLine.Option(names = ["--verbose"], description = ["display info messages from sonar plugins"])
    private var verbose = false

    @CommandLine.Parameters(arity = "1", paramLabel = "FOLDER or FILE", description = ["project folder or code file"])
    private var file: File? = null

    override val name = NAME
    override val description = DESCRIPTION

    companion object {
        const val NAME = "sourcecodeparser"
        const val DESCRIPTION = "generates cc.json from source code"
        const val FOOTER =
            "This program uses the SonarJava, which is licensed under the GNU Lesser General Public Library, version 3.\n" +
                CodeChartaConstants.General.GENERIC_FOOTER

        @JvmStatic
        fun main(args: Array<String>) {
            mainWithOutputStream(System.out, args)
        }

        @JvmStatic
        fun mainWithOutputStream(outputStream: PrintStream, args: Array<String>) {
            CommandLine(SourceCodeParserMain(outputStream)).execute(*args)
        }

        @JvmStatic
        fun mainWithInOut(outputStream: PrintStream, input: InputStream, error: PrintStream, args: Array<String>) {
            CommandLine(SourceCodeParserMain(outputStream, input, error))
                .setOut(PrintWriter(outputStream))
                .execute(*args)
        }

        private val DEFAULT_EXCLUDES = arrayOf("/out/", "/build/", "/target/", "/dist/", "/resources/", "/\\..*")
    }

    @Throws(IOException::class)
    override fun call(): Unit? {
        logPipeableParserSyncSignal(PipeableParserSyncFlag.SYNC_FLAG)

        if (!InputHelper.isInputValidAndNotNull(arrayOf(file), canInputContainFolders = true)) {
            throw IllegalArgumentException("Input invalid file for SourceCodeParser, stopping execution...")
        }

        if (defaultExcludes) exclude += Companion.DEFAULT_EXCLUDES

        val projectParser = ProjectParser(exclude, verbose, !findNoIssues)

        projectParser.setUpAnalyzers()
        projectParser.scanProject(file!!)

        val writer = getMetricWriter()
        val pipedProject = ProjectDeserializer.deserializeProject(input)
        writer.generate(projectParser.projectMetrics, projectParser.metricKinds, pipedProject)

        logOutputFilePath()

        return null
    }

    private fun getMetricWriter(): MetricWriter {
        return when (outputFormat) {
            OutputFormat.JSON -> JSONMetricWriter(getJsonOutputStream(), compress && outputFile != null)
            OutputFormat.CSV -> CSVMetricWriter(getCsvOutputWriter())
        }
    }

    private fun getCsvOutputWriter(): Writer {
        return if (outputFile == null) {
            OutputStreamWriter(output)
        } else {
            val outputName = outputFile!!.name
            BufferedWriter(FileWriter(OutputFileHandler.checkAndFixFileExtension(outputName, false, FileExtension.CSV)))
        }
    }

    private fun logOutputFilePath() {
        outputFile?.let { nonNullOutputFile ->
            val absoluteFilePath =
                if (outputFormat == OutputFormat.CSV) {
                    OutputFileHandler.checkAndFixFileExtension(
                        nonNullOutputFile.absolutePath,
                        false,
                        FileExtension.CSV
                    )
                } else {
                    OutputFileHandler.checkAndFixFileExtension(
                        nonNullOutputFile.absolutePath,
                        compress,
                        FileExtension.JSON
                    )
                }
            Logger.info { "Created output file at $absoluteFilePath" }
        }
    }

    private fun getJsonOutputStream() = OutputFileHandler.stream(outputFile?.absolutePath, output, compress)

    override fun getDialog(): ParserDialogInterface = ParserDialog

    override fun isApplicable(resourceToBeParsed: String): Boolean {
        println("Checking if SourceCodeParser is applicable...")
        return ResourceSearchHelper.isFileWithOneOrMoreOfEndingsPresent(resourceToBeParsed, listOf(".java"))
    }

    override fun getAttributeDescriptorMaps(): Map<String, AttributeDescriptor> {
        return getAttributeDescriptors()
    }
}
