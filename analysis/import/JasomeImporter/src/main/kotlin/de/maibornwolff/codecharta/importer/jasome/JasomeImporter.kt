package de.maibornwolff.codecharta.importer.jasome

import de.maibornwolff.codecharta.serialization.ProjectSerializer
import picocli.CommandLine
import java.io.File
import java.io.Writer
import java.util.concurrent.Callable

@CommandLine.Command(
        name = "jasomeimport",
        description = ["generates cc.json from jasome xml file"],
        footer = ["Copyright(c) 2020, MaibornWolff GmbH"]
)
class JasomeImporter : Callable<Void> {

    @CommandLine.Parameters(arity = "1", paramLabel = "FILE", description = ["file to parse"])
    private var file: File? = null

    @CommandLine.Option(names = ["-h", "--help"], usageHelp = true, description = ["displays this help and exits"])
    private var help = false

    @CommandLine.Option(names = ["-o", "--output-file"], description = ["output File (or empty for stdout)"])
    private var outputFile: File? = null

    @CommandLine.Option(names = ["-c"], description = ["compress output File to gzip format"])
    private var compress = false

    override fun call(): Void? {
        val jasomeProject = JasomeDeserializer().deserializeJasomeXML(file!!.inputStream())
        val project = JasomeProjectBuilder().add(jasomeProject).build()
        val filePath = outputFile?.absolutePath ?: "notSpecified"

        if (compress && filePath != "notSpecified") ProjectSerializer.serializeAsCompressedFile(project, filePath) else ProjectSerializer.serializeProject(project, writer())

        return null
    }

    private fun writer(): Writer {
        return outputFile?.writer() ?: System.out.writer()
    }

    companion object {

        @JvmStatic
        fun main(args: Array<String>) {
            CommandLine.call(JasomeImporter(), System.out, *args)
        }
    }
}
