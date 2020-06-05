package de.maibornwolff.codecharta.importer.sourcecodeparser

import de.maibornwolff.codecharta.importer.sourcecodeparser.metricwriters.CSVMetricWriter
import de.maibornwolff.codecharta.importer.sourcecodeparser.metricwriters.JSONMetricWriter
import de.maibornwolff.codecharta.importer.sourcecodeparser.metricwriters.MetricWriter
import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import picocli.CommandLine.*
import java.io.*
import java.nio.file.Paths
import java.util.concurrent.Callable

@Command(
    name = "sourcecodeparser",
    description = ["generates cc.json from source code"],
    footer = ["This program uses the SonarJava, which is licensed under the GNU Lesser General Public Library, version 3.\nCopyright(c) 2020, MaibornWolff GmbH"]
)
class SourceCodeParserMain(
    private val outputStream: PrintStream,
    private val input: InputStream = System.`in`,
    private val error: PrintStream = System.err
) : Callable<Void> {
    // we need this constructor because ccsh requires an empty constructor
    constructor() : this(System.out)

    private val DEFAULT_EXCLUDES = arrayOf("/out/", "/build/", "/target/", "/dist/", "/resources/", "/\\..*")

    @Option(names = ["-h", "--help"], usageHelp = true, description = ["displays this help and exits"])
    private var help = false

    @Option(names = ["-i", "--no-issues"], description = ["do not search for sonar issues"])
    private var findNoIssues = false

    @Option(names = ["-e", "--exclude"], description = ["exclude file/folder according to regex pattern"])
    private var exclude: Array<String> = arrayOf()

    @Option(
        names = ["--default-excludes"],
        description = ["exclude build, target, dist and out folders as well as files/folders starting with '.' "]
    )
    private var defaultExcludes = false

    @Option(
        names = ["-f", "--format"],
        description = ["the format to output"],
        converter = [(OutputTypeConverter::class)]
    )
    private var outputFormat = OutputFormat.JSON

    @Option(names = ["-o", "--output-file"], description = ["output File (or empty for stdout)"])
    private var outputFile: File? = null

    @Option(names = ["-v", "--verbose"], description = ["display info messages from sonar plugins"])
    private var verbose = false

    @Parameters(arity = "1", paramLabel = "FOLDER or FILE", description = ["project folder or code file"])
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
            OutputFormat.JSON -> JSONMetricWriter(getOutputWriter())
            OutputFormat.TABLE -> CSVMetricWriter(getOutputWriter())
        }
    }

    private fun getOutputWriter(): Writer {
        return if (outputFile == null) {
            OutputStreamWriter(outputStream)
        } else {
            BufferedWriter(FileWriter(outputFile!!))
        }
    }

    companion object {
        @JvmStatic
        fun main(args: Array<String>) {
            mainWithOutputStream(System.out, args)
        }

        @JvmStatic
        fun mainWithOutputStream(outputStream: PrintStream, args: Array<String>) {
            call(SourceCodeParserMain(outputStream), System.out, *args)
        }

        @JvmStatic
        fun mainWithInOut(outputStream: PrintStream, input: InputStream, error: PrintStream, args: Array<String>) {
            call(SourceCodeParserMain(outputStream, input, error), outputStream, *args)
        }
    }
}

