package de.maibornwolff.codecharta.importer.sourcecodeparser

import de.maibornwolff.codecharta.importer.sourcecodeparser.metricwriters.CSVMetricWriter
import de.maibornwolff.codecharta.importer.sourcecodeparser.metricwriters.JSONMetricWriter
import de.maibornwolff.codecharta.importer.sourcecodeparser.metricwriters.MetricWriter
import picocli.CommandLine.*
import java.io.*
import java.nio.file.Paths
import java.util.concurrent.Callable

@Command(
        name = "sourcecodeparser",
        description = ["generates cc.json from source code"],
        footer = ["This program uses the SonarJava, which is licensed under the GNU Lesser General Public Library, version 3.\nCopyright(c) 2019, MaibornWolff GmbH"]
)
class SourceCodeParserMain(private val outputStream: PrintStream) : Callable<Void> {
    // we need this constructor because ccsh requires an empty constructor
    constructor() : this(System.out)

    private val DEFAULT_EXCLUDES = arrayOf("/out/", "/build/", "/target/", "/dist/", "/\\..*")

    @Option(names = ["-h", "--help"], usageHelp = true, description = ["displays this help and exits"])
    private var help = false

    @Option(names = ["-i", "--noIssues"], description = ["do not search for sonar issues"])
    private var findNoIssues = false

    @Option(names = ["-e", "--exclude"], description = ["exclude file/folder according to regex pattern"])
    private var exclude: Array<String> = arrayOf()

    @Option(names = ["--defaultExcludes"], description = ["exclude build, target, dist and out folders as well as files/folders starting with '.' "])
    private var defaultExcludes = false

    @Option(names = ["-p", "--projectName"], description = ["project name"])
    private var projectName = "DefaultProjectName"

    @Option(names = ["-f", "--format"], description = ["the format to output"], converter = [(OutputTypeConverter::class)])
    private var outputFormat = OutputFormat.JSON

    @Option(names = ["-o", "--outputFile"], description = ["output File (or empty for stdout)"])
    private var outputFile: File? = null

    @Option(names = ["-v", "--verbose"], description = ["display info messages from sonar plugins"])
    private var verbose = false

    @Parameters(arity = "1", paramLabel = "FOLDER or FILE", description = ["project folder or code file"])
    private var file: File = File("")

    @Throws(IOException::class)
    override fun call(): Void? {

        if (!file.exists()) {
            val path = Paths.get("").toAbsolutePath().toString()
            outputStream.println("Current working directory = $path")
            outputStream.println("Could not find $file")
            return null
        }

        if (defaultExcludes) exclude += DEFAULT_EXCLUDES

        val projectParser = ProjectParser(exclude, verbose, !findNoIssues)

        projectParser.setUpAnalyzers()
        projectParser.scanProject(file)

        val writer = getPrinter()
        writer.generate(projectParser.projectMetrics, projectParser.metricKinds)

        return null
    }

    private fun getPrinter(): MetricWriter {
        return when (outputFormat) {
            OutputFormat.JSON -> JSONMetricWriter(projectName, getWriter())
            OutputFormat.TABLE -> CSVMetricWriter(getWriter())
        }
    }

    private fun getWriter(): Writer {
        return if (outputFile == null) {
            OutputStreamWriter(outputStream)
        } else {
            BufferedWriter(FileWriter(outputFile))
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
    }
}

