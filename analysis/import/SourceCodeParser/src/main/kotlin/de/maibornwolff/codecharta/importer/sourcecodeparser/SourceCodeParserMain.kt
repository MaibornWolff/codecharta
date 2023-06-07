package de.maibornwolff.codecharta.importer.sourcecodeparser

import de.maibornwolff.codecharta.importer.sourcecodeparser.metricwriters.CSVMetricWriter
import de.maibornwolff.codecharta.importer.sourcecodeparser.metricwriters.JSONMetricWriter
import de.maibornwolff.codecharta.importer.sourcecodeparser.metricwriters.MetricWriter
import de.maibornwolff.codecharta.serialization.OutputFileHandler
import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import de.maibornwolff.codecharta.tools.interactiveparser.InteractiveParser
import de.maibornwolff.codecharta.tools.interactiveparser.ParserDialogInterface
import de.maibornwolff.codecharta.tools.interactiveparser.util.InteractiveParserHelper
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
import java.nio.file.Paths
import java.util.concurrent.Callable

@CommandLine.Command(
    name = InteractiveParserHelper.SourceCodeParserConstants.name,
    description = [InteractiveParserHelper.SourceCodeParserConstants.description],
    footer = [InteractiveParserHelper.SourceCodeParserConstants.footer]
)
class SourceCodeParserMain(
    private val outputStream: PrintStream,
    private val input: InputStream = System.`in`,
    private val error: PrintStream = System.err
) : Callable<Void>, InteractiveParser {
    // we need this constructor because ccsh requires an empty constructor
    constructor() : this(System.out)

    private val DEFAULT_EXCLUDES = arrayOf("/out/", "/build/", "/target/", "/dist/", "/resources/", "/\\..*")

    @CommandLine.Option(names = ["-h", "--help"], usageHelp = true, description = ["displays this help and exits"])
    private var help = false

    @CommandLine.Option(names = ["-i", "--no-issues"], description = ["do not search for sonar issues"])
    private var findNoIssues = false

    @CommandLine.Option(names = ["-e", "--exclude"], description = ["exclude file/folder according to regex pattern"])
    private var exclude: Array<String> = arrayOf()

    @CommandLine.Option(
        names = ["--default-excludes"],
        description = ["exclude build, target, dist and out folders as well as files/folders starting with '.' "]
    )
    private var defaultExcludes = false

    @CommandLine.Option(
        names = ["-f", "--format"],
        description = ["the format to output"],
        converter = [(OutputTypeConverter::class)]
    )
    private var outputFormat = OutputFormat.JSON

    @CommandLine.Option(names = ["-o", "--output-file"], description = ["output File (or empty for stdout)"])
    private var outputFile: File? = null

    @CommandLine.Option(names = ["-nc", "--not-compressed"], description = ["save uncompressed output File"])
    private var compress = true

    @CommandLine.Option(names = ["-v", "--verbose"], description = ["display info messages from sonar plugins"])
    private var verbose = false

    @CommandLine.Parameters(arity = "1", paramLabel = "FOLDER or FILE", description = ["project folder or code file"])
    private var file: File = File("")

    @Throws(IOException::class)
    override fun call(): Void? {

        print(" ")
        if (!file.exists()) {
            val path = Paths.get("").toAbsolutePath().toString()
            error.println("Current working directory = $path")
            error.println("Could not find $file")
            return null
        }

        if (defaultExcludes) exclude += DEFAULT_EXCLUDES

        val projectParser = ProjectParser(exclude, verbose, !findNoIssues)

        projectParser.setUpAnalyzers()
        projectParser.scanProject(file)

        val writer = getMetricWriter()
        val pipedProject = ProjectDeserializer.deserializeProject(input)
        writer.generate(projectParser.projectMetrics, projectParser.metricKinds, pipedProject)

        return null
    }

    private fun getMetricWriter(): MetricWriter {
        return when (outputFormat) {
            OutputFormat.JSON -> JSONMetricWriter(getJsonOutputStream(), compress && outputFile != null)
            OutputFormat.TABLE -> CSVMetricWriter(getCsvOutputWriter())
        }
    }

    private fun getCsvOutputWriter(): Writer {
        return if (outputFile == null) {
            OutputStreamWriter(outputStream)
        } else {
            BufferedWriter(FileWriter(outputFile!!))
        }
    }

    private fun getJsonOutputStream() = OutputFileHandler.stream(outputFile?.absolutePath, outputStream, compress)

    companion object {
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
    }

    override fun getDialog(): ParserDialogInterface = ParserDialog
    override fun isApplicable(resourceToBeParsed: String): Boolean {
        println("Checking if SourceCodeParser is applicable...")
        return ResourceSearchHelper.isFileWithOneOrMoreOfEndingsPresent(resourceToBeParsed, listOf(".java"))
    }

    override fun getName(): String {
        return InteractiveParserHelper.SourceCodeParserConstants.name
    }
}
