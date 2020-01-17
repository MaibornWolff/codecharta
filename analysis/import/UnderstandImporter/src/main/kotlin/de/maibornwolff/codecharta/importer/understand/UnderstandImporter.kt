package de.maibornwolff.codecharta.importer.understand

import de.maibornwolff.codecharta.serialization.ProjectSerializer
import mu.KotlinLogging
import picocli.CommandLine
import java.io.*
import java.util.concurrent.Callable

@CommandLine.Command(name = "understandimport", description = ["generates cc.json from SciTools (TM) Understand csv"],
        footer = ["Copyright(c) 2020, MaibornWolff GmbH"])
class UnderstandImporter: Callable<Void> {

    @CommandLine.Option(names = ["-h", "--help"], usageHelp = true, description = ["displays this help and exits"])
    private var help = false

    @CommandLine.Option(names = ["-o", "--outputFile"], description = ["output File (or empty for stdout)"])
    private var outputFile: File? = null

    @CommandLine.Parameters(arity = "1..*", paramLabel = "FILE", description = ["Understand csv files"])
    private var files: List<File> = mutableListOf()

    @CommandLine.Option(names = ["--pathSeparator"], description = ["path separator (default = '/')"])
    private var pathSeparator = '/'

    private val logger = KotlinLogging.logger {}

    @Throws(IOException::class)
    override fun call(): Void? {
        val projectBuilder = UnderstandProjectBuilder(pathSeparator)
        files.forEach { projectBuilder.parseCSVStream(it.inputStream()) }
        val project = projectBuilder.build()
        ProjectSerializer.serializeProject(project, writer())

        logger.info { "Created project with ${project.size} leafs." }

        return null
    }

    private fun writer(): Writer {
        return if (outputFile == null) {
            OutputStreamWriter(System.out)
        } else {
            BufferedWriter(FileWriter(outputFile))
        }
    }

    companion object {
        @JvmStatic
        fun main(args: Array<String>) {
            CommandLine.call(UnderstandImporter(), System.out, *args)
        }
    }
}

