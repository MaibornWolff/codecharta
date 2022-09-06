package de.maibornwolff.codecharta.importer.understand

import de.maibornwolff.codecharta.serialization.ProjectSerializer
import mu.KotlinLogging
import picocli.CommandLine
import java.io.File
import java.io.IOException
import java.io.PrintStream
import java.util.concurrent.Callable

@CommandLine.Command(
    name = "understandimport",
    description = ["generates cc.json from SciTools (TM) Understand csv"],
    footer = ["Copyright(c) 2020, MaibornWolff GmbH"]
)
class UnderstandImporter(private val output: PrintStream = System.out) : Callable<Void> {

    @CommandLine.Option(names = ["-h", "--help"], usageHelp = true, description = ["displays this help and exits"])
    private var help = false

    @CommandLine.Option(names = ["-o", "--output-file"], description = ["output File (or empty for stdout)"])
    private var outputFile: String? = null

    @CommandLine.Option(names = ["-nc", "--not-compressed"], description = ["save uncompressed output File"])
    private var compress = true

    @CommandLine.Parameters(arity = "1..*", paramLabel = "FILE", description = ["Understand csv files"])
    private var files: List<File> = mutableListOf()

    @CommandLine.Option(names = ["--path-separator"], description = ["path separator (default = '/')"])
    private var pathSeparator = '/'

    private val logger = KotlinLogging.logger {}

    @Throws(IOException::class)
    override fun call(): Void? {
        val projectBuilder = UnderstandProjectBuilder(pathSeparator)
        files.forEach { projectBuilder.parseCSVStream(it.inputStream()) }
        val project = projectBuilder.build()

        ProjectSerializer.serializeToFileOrStream(project, outputFile, output, compress)

        logger.info { "Created project with ${project.size} leafs." }

        return null
    }

    companion object {
        @JvmStatic
        fun main(args: Array<String>) {
            CommandLine(UnderstandImporter()).execute(*args)
        }
    }
}
