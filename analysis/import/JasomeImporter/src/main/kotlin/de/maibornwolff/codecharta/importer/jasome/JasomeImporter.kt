package de.maibornwolff.codecharta.importer.jasome

import de.maibornwolff.codecharta.serialization.OutputFileHandler
import de.maibornwolff.codecharta.serialization.ProjectSerializer
import picocli.CommandLine
import java.io.File
import java.io.PrintStream
import java.util.concurrent.Callable

@CommandLine.Command(
    name = "jasomeimport",
    description = ["generates cc.json from jasome xml file"],
    footer = ["Copyright(c) 2020, MaibornWolff GmbH"]
)
class JasomeImporter(
        private val output: PrintStream = System.out,
        private val test: Boolean = false) : Callable<Void> {

    @CommandLine.Parameters(arity = "1", paramLabel = "FILE", description = ["file to parse"])
    private var file: File? = null

    @CommandLine.Option(names = ["-h", "--help"], usageHelp = true, description = ["displays this help and exits"])
    private var help = false

    @CommandLine.Option(names = ["-o", "--output-file"], description = ["output File"])
    private var outputFile: String? = null

    @CommandLine.Option(names = ["--systemout"], description = ["write output in terminal"])
    private var systemout = false

    @CommandLine.Option(names = ["-nc", "--not-compressed"], description = ["save uncompressed output File"])
    private var compress = true

    override fun call(): Void? {
        val jasomeProject = JasomeDeserializer().deserializeJasomeXML(file!!.inputStream())
        val project = JasomeProjectBuilder().add(jasomeProject).build()
        val filePath = outputFile ?: "notSpecified"

        if (compress && filePath != "notSpecified") ProjectSerializer.serializeAsCompressedFile(project,
                OutputFileHandler.checkAndFixFileExtension(filePath)) else ProjectSerializer.serializeProject(project, OutputFileHandler.writer(outputFile ?: "", systemout || test, output))

        return null
    }

    /**
    private fun writer(): Writer {
        return outputFile?.writer() ?: System.out.writer()
    }
**/
    companion object {

        @JvmStatic
        fun main(args: Array<String>) {
            CommandLine.call(JasomeImporter(), System.out, *args)
        }
    }
}
