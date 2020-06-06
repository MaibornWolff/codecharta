package de.maibornwolff.codecharta.importer.crococosmo

import de.maibornwolff.codecharta.serialization.ProjectSerializer
import picocli.CommandLine
import java.io.File
import java.util.concurrent.Callable

@CommandLine.Command(
        name = "crococosmoimport",
        description = ["generates cc.json from crococosmo xml file"],
        footer = ["Copyright(c) 2020, MaibornWolff GmbH"]
)
class CrococosmoImporter: Callable<Void> {

    @CommandLine.Parameters(arity = "1", paramLabel = "FILE", description = ["file to parse"])
    private var file: File? = null

    @CommandLine.Option(names = ["-c"], description = ["compress output File to gzip format"])
    private var compress = false

    @CommandLine.Option(names = ["-h", "--help"], usageHelp = true, description = ["displays this help and exits"])
    private var help = false

    @CommandLine.Option(names = ["-o", "--output-file"],
            description = ["output File or prefix for File (or empty for stdout)"])
    private var outputFile: String? = null

    override fun call(): Void? {
        val graph = CrococosmoDeserializer().deserializeCrococosmoXML(file!!.inputStream())
        val projects = CrococosmoConverter().convertToProjectsMap(graph)
        projects.forEach {
            val suffix = if (projects.isNotEmpty()) "_" + it.key else ""
            ProjectSerializer.serializeProject(it.value, writer(suffix))

            val filePath = file?.absolutePath ?: "notSpecified"

            if(compress && filePath != "notSpecified") ProjectSerializer.serializeAsCompressedFile(it.value,filePath) else ProjectSerializer.serializeProject(it.value, writer(suffix))

        }

        return null
    }

    private fun writer(name: String = "") =
            when {
                outputFile.isNullOrEmpty() -> System.out.bufferedWriter()
                else                       -> File(outputFile + name).bufferedWriter()
            }

    companion object {

        @JvmStatic
        fun main(args: Array<String>) {
            CommandLine.call(CrococosmoImporter(), System.out, *args)
        }
    }
}
