package de.maibornwolff.codecharta.importer.crococosmo

import de.maibornwolff.codecharta.serialization.ProjectSerializer
import picocli.CommandLine
import java.io.File
import java.io.PrintStream
import java.util.concurrent.Callable

@CommandLine.Command(
    name = "crococosmoimport",
    description = ["generates cc.json from crococosmo xml file"],
    footer = ["Copyright(c) 2020, MaibornWolff GmbH"]
)
class CrococosmoImporter(private val output: PrintStream = System.out) : Callable<Void> {

    @CommandLine.Parameters(arity = "1", paramLabel = "FILE", description = ["file to parse"])
    private var inputFile: File? = null

    @CommandLine.Option(names = ["-nc", "--not-compressed"], description = ["save uncompressed output File"])
    private var compress = true

    @CommandLine.Option(names = ["-h", "--help"], usageHelp = true, description = ["displays this help and exits"])
    private var help = false

    @CommandLine.Option(
        names = ["-o", "--output-file"], description = ["output File or prefix for File (or empty for stdout)"]
    )
    private var outputFile: String? = null

    override fun call(): Void? {
        val graph = CrococosmoDeserializer().deserializeCrococosmoXML(inputFile!!.inputStream())
        val projects = CrococosmoConverter().convertToProjectsMap(graph)
        projects.forEach {
            val suffix = "_" + it.key
            val filePath = if(outputFile == null) null else outputFile + suffix

            ProjectSerializer.serializeToFileOrStream(it.value, filePath, output, compress)
        }
        return null
    }

    companion object {

        @JvmStatic
        fun main(args: Array<String>) {
            CommandLine.call(CrococosmoImporter(), System.out, *args)
        }
    }
}
