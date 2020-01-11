package de.maibornwolff.codecharta.importer.rawtextparser

import de.maibornwolff.codecharta.importer.rawtextparser.model.FileMetrics
import de.maibornwolff.codecharta.importer.rawtextparser.model.toInt
import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import picocli.CommandLine
import picocli.CommandLine.call
import java.io.*
import java.nio.file.Paths
import java.util.concurrent.Callable

@CommandLine.Command(
        name = "intendationlevelparser",
        description = ["generates cc.json from projects or source code files"],
        footer = ["Copyright(c) 2020, MaibornWolff GmbH"]
)
class RawTextParser(private val input: InputStream = System.`in`,
                    private val output: PrintStream = System.out,
                    private val error: PrintStream = System.err) : Callable<Void> {

    private val DEFAULT_EXCLUDES = arrayOf("/out/", "/build/", "/target/", "/dist/", "/resources/", "/\\..*")

    @CommandLine.Option(names = ["-h", "--help"], usageHelp = true, description = ["displays this help and exits"])
    private var help = false

    @CommandLine.Option(names = ["-v", "--verbose"], description = ["verbose mode"])
    private var verbose = false

    @CommandLine.Parameters(arity = "1", paramLabel = "FILE or FOLDER", description = ["file/project to parse"])
    private var file: File = File("")

    @CommandLine.Option(arity = "0..", names = ["-m", "--metrics"], description = ["metrics to be computed (select all if not specified)"])
    private var metrics: List<String> = listOf()

    @CommandLine.Option(names = ["-o", "--outputFile"], description = ["output File (or empty for stdout)"])
    private var outputFile: File? = null

    @CommandLine.Option(names = ["-p", "--projectName"], description = ["project name"])
    private var projectName = ""

    @CommandLine.Option(names = ["--tabWidth"], description = ["tab width used (estimated if not provided)"])
    private var tabWith: Int? = null

    @CommandLine.Option(names = ["--maxIndentationLevel"], description = ["maximum Indentation Level (default 10)"])
    private var maxIndentLvl: Int? = null

    @CommandLine.Option(names = ["-e", "--exclude"], description = ["exclude file/folder according to regex pattern"])
    private var exclude: Array<String> = arrayOf()

    @CommandLine.Option(names = ["--withoutDefaultExcludes"], description = ["include build, target, dist, resources and out folders as well as files/folders starting with '.' "])
    private var defaultExcludes = false

    @Throws(IOException::class)
    override fun call(): Void? {
        print(" ")
        if (!file.exists()) {
            fileNotExistentMessage()
            return null
        }

        if (defaultExcludes) exclude += DEFAULT_EXCLUDES

        val parameterMap = assembleParameterMap()
        val results: Map<String, FileMetrics> = MetricCollector(file, exclude, parameterMap, metrics).parse()

        val pipedProject = ProjectDeserializer.deserializeProject(input)
        ProjectGenerator(getWriter()).generate(results, projectName, pipedProject)
        return null
    }

    private fun fileNotExistentMessage() {
        val path = Paths.get("").toAbsolutePath().toString()
        error.println("Current working directory = $path")
        error.println("Could not find $file")
    }

    private fun getWriter(): Writer {
        return if (outputFile != null) {
            BufferedWriter(FileWriter(outputFile!!))
        } else {
            OutputStreamWriter(output)
        }
    }

    private fun assembleParameterMap(): Map<String, Int> {
        return mapOf(
                "verbose" to verbose.toInt(),
                "maxIndentationLevel" to maxIndentLvl,
                "tabWidth" to tabWith
        ).filterValues { it != null }.mapValues { it.value as Int }
    }

    companion object {
        @JvmStatic
        fun main(args: Array<String>) {
            mainWithOutputStream(System.out, args)
        }

        @JvmStatic
        fun mainWithOutputStream(outputStream: PrintStream, args: Array<String>) {
            call(RawTextParser(System.`in`, outputStream), System.out, *args)
        }

        @JvmStatic
        fun mainWithInOut(outputStream: PrintStream, input: InputStream, error: PrintStream, args: Array<String>) {
            call(RawTextParser(input, outputStream, error), outputStream, *args)
        }
    }
}