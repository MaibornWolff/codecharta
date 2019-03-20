package de.maibornwolff.codecharta.importer.sourcecodeparser

import de.maibornwolff.codecharta.importer.sourcecodeparser.exporters.CSVExporter
import de.maibornwolff.codecharta.importer.sourcecodeparser.exporters.Exporter
import de.maibornwolff.codecharta.importer.sourcecodeparser.exporters.JSONExporter
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.infrastructure.antlr.java.AntlrJavaCodeTagProvider
import de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.application.*
import de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.infrastructure.FileSystemDetailedSourceProvider
import de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.infrastructure.FileSystemOverviewSourceProvider
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

    @Parameters(arity = "1..*", paramLabel = "FOLDER or FILEs", description = ["single code folder or files"])
    private var files: List<File> = mutableListOf()

    @Throws(IOException::class)
    override fun call(): Void? {

        if (!files[0].exists()) {
            val path = Paths.get("").toAbsolutePath().toString()
            outputStream.println("Current working directory = $path")
            outputStream.println("Could not find " + files[0])
            return null
        }
        //val sourceCodeParserEntryPoint = getSourceCodeParserEntryPoint()
        val projectParser = ProjectParser()

        // TODO: Support multiple in file/folders
        projectParser.scanProject(files[0], OutputStreamWriter(outputStream))

        val writer = getPrinter()
        writer.generate(projectParser.projectMetrics, projectParser.metricKinds)

        return null
    }

    // TODO: i think it does not switch...
    private fun getPrinter(): Exporter {
        return when (outputFormat) {
            OutputFormat.JSON -> JSONExporter(projectName, getWriter())
            OutputFormat.TABLE -> CSVExporter(getWriter())
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

