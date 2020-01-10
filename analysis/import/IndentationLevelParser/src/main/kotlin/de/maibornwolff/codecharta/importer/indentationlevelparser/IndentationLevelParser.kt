package de.maibornwolff.codecharta.importer.indentationlevelparser

import de.maibornwolff.codecharta.importer.indentationlevelparser.model.FileMetrics
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
class IndentationLevelParser(private val input: InputStream = System.`in`,
                             private val output: PrintStream = System.out,
                             private val error: PrintStream = System.err) : Callable<Void> {

    private val DEFAULT_EXCLUDES = arrayOf("/out/", "/build/", "/target/", "/dist/", "/resources/", "/\\..*")

    @CommandLine.Option(names = ["-h", "--help"], usageHelp = true, description = ["displays this help and exits"])
    private var help = false

    @CommandLine.Option(names = ["-v", "--verbose"], description = ["verbose mode"])
    private var verbose = false

    @CommandLine.Parameters(arity = "1", paramLabel = "FILE or FOLDER", description = ["file/project to parse"])
    private var file: File = File("")

    @CommandLine.Option(names = ["-o", "--outputFile"], description = ["output File (or empty for stdout)"])
    private var outputFile: File? = null

    @CommandLine.Option(names = ["-p", "--projectName"], description = ["project name"])
    private var projectName = ""

    @CommandLine.Option(names = ["-w", "--tabWidth"], description = ["tab width used (estimated if not provided)"])
    private var tabWith = 0

    @CommandLine.Option(names = ["-m", "--maxLevel"], description = ["maximum Indentation Level (default 10)"])
    private var maxIndentLvl = 10

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
        val results: Map<String, FileMetrics> = MetricCollector(file, tabWith, maxIndentLvl, error, exclude, verbose).parse()

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

    companion object {
        @JvmStatic
        fun main(args: Array<String>) {
            mainWithOutputStream(System.out, args)
        }

        @JvmStatic
        fun mainWithOutputStream(outputStream: PrintStream, args: Array<String>) {
            call(IndentationLevelParser(System.`in`, outputStream), System.out, *args)
        }

        @JvmStatic
        fun mainWithInOut(outputStream: PrintStream, input: InputStream, error: PrintStream, args: Array<String>) {
            call(IndentationLevelParser(input, outputStream, error), outputStream, *args)
        }
    }
}