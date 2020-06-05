package de.maibornwolff.codecharta.importer.jasome

import de.maibornwolff.codecharta.serialization.ProjectSerializer
import picocli.CommandLine
import java.io.File
import java.util.concurrent.Callable

@CommandLine.Command(
        name = "jasomeimport",
        description = ["generates cc.json from jasome xml file"],
        footer = ["Copyright(c) 2020, MaibornWolff GmbH"]
)
class JasomeImporter: Callable<Void> {

    @CommandLine.Parameters(arity = "1", paramLabel = "FILE", description = ["file to parse"])
    private var file: File? = null

    @CommandLine.Option(names = ["-h", "--help"], usageHelp = true, description = ["displays this help and exits"])
    private var help = false

    @CommandLine.Option(names = ["-o", "--output-file"], description = ["output File (or empty for stdout)"])
    private var outputFile: File? = null

    private var writer = outputFile?.writer() ?: System.out.writer()

    override fun call(): Void? {
        val jasomeProject = JasomeDeserializer().deserializeJasomeXML(file!!.inputStream())
        val project = JasomeProjectBuilder().add(jasomeProject).build()
        ProjectSerializer.serializeProject(project, writer)

        return null
    }

    companion object {

        @JvmStatic
        fun main(args: Array<String>) {
            CommandLine.call(JasomeImporter(), System.out, *args)
        }
    }
}
