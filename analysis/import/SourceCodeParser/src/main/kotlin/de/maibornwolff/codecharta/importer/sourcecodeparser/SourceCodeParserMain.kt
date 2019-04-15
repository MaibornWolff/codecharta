package de.maibornwolff.codecharta.importer.sourcecodeparser

import de.maibornwolff.codecharta.importer.sourcecodeparser.metricwriters.CSVMetricWriter
import de.maibornwolff.codecharta.importer.sourcecodeparser.metricwriters.MetricWriter
import de.maibornwolff.codecharta.importer.sourcecodeparser.metricwriters.JSONMetricWriter
import picocli.CommandLine.*
import java.io.*
import java.nio.file.Paths
import java.util.concurrent.Callable

@Command(name = "sourcecodeparser", description = ["generates cc.JSON from source code"], footer = ["Copyright(c) 2018, MaibornWolff GmbH"])
class SourceCodeParserMain(private val outputStream: PrintStream) : Callable<Void> {
    // we need this constructor because ccsh requires an empty constructor
    constructor() : this(System.out)

    @Option(names = ["-h", "--help"], usageHelp = true, description = ["displays this help and exits"])
    private var help = false

    @Option(names = ["-p", "--projectName"], description = ["project name"])
    private var projectName = "DefaultProjectName"

    @Option(names = ["-f", "--format"], description = ["the format to output"], converter = [(OutputTypeConverter::class)])
    private var outputFormat = OutputFormat.JSON

    @Option(names = ["-o", "--outputFile"], description = ["output File (or empty for stdout)"])
    private var outputFile: File? = null

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
        val projectParser = ProjectParser()

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

