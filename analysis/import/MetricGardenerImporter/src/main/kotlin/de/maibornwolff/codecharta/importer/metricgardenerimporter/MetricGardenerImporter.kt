package de.maibornwolff.codecharta.importer.metricgardenerimporter

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.maibornwolff.codecharta.importer.metricgardenerimporter.json.MetricGardenerProjectBuilder
import de.maibornwolff.codecharta.importer.metricgardenerimporter.model.MetricGardenerNodes
import de.maibornwolff.codecharta.serialization.FileExtensionHandler
import de.maibornwolff.codecharta.serialization.ProjectSerializer
import de.maibornwolff.codecharta.tools.interactiveparser.InteractiveParser
import de.maibornwolff.codecharta.tools.interactiveparser.ParserDialogInterface
import mu.KotlinLogging
import picocli.CommandLine
import java.io.BufferedWriter
import java.io.File
import java.io.FileWriter
import java.io.IOException
import java.nio.charset.Charset
import java.nio.file.Paths
import java.util.concurrent.Callable

@CommandLine.Command(
    name = "metricgardenerimport",
    description = ["generates a cc.json file from a project parsed with metric-gardener"],
    footer = ["Copyright(c) 2022, MaibornWolff GmbH"]
                    )

class MetricGardenerImporter : Callable<Void>, InteractiveParser {

    private val logger = KotlinLogging.logger {}
    private val mapper = jacksonObjectMapper()

    @CommandLine.Option(
        names = ["-h", "--help"], usageHelp = true,
        description = ["Specify: path/to/input/folder/or/file -o path/to/outputfile.json"]
                       )
    private var help = false

    @CommandLine.Parameters(
        arity = "1", paramLabel = "FOLDER or FILE",
        description = ["path for project folder or code file"]
                           )
    private var inputFile = File("")

    @CommandLine.Option(names = ["-o", "--output-file"], description = ["output File (or empty for stdout)"])
    private var outputFilePathName = ""

    @CommandLine.Option(names = ["-nc", "--not-compressed"], description = ["save uncompressed output File"])
    private var compress = true

    @Throws(IOException::class)
    override fun call(): Void? {
        if (!inputFile.exists()) {
            printErrorLog()
            return null
        }
       var outputFile = File(FileExtensionHandler.checkAndFixFileExtension(outputFilePathName))
        val metricGardenerNodes: MetricGardenerNodes =
            mapper.readValue(inputFile.reader(Charset.defaultCharset()), MetricGardenerNodes::class.java)
        val metricGardenerProjectBuilder = MetricGardenerProjectBuilder(metricGardenerNodes)
        val project = metricGardenerProjectBuilder.build()
        val filePath = outputFile.absolutePath ?: "notSpecified"
        if (compress && filePath != "notSpecified") {
            ProjectSerializer.serializeAsCompressedFile(project, filePath)
        } else {
            val outputWriter = BufferedWriter(FileWriter(outputFile))
            ProjectSerializer.serializeProject(project, outputWriter)
        }

        return null
    }

    private fun printErrorLog() {
        val path = Paths.get("").toAbsolutePath().toString()
        logger.error { "Current working directory = $path" }
        logger.error { "Could not find $inputFile" }
    }

    companion object {

        @JvmStatic
        fun main(args: Array<String>) {
            CommandLine.call(MetricGardenerImporter(), System.out, *args)
        }
    }

    override fun getDialog(): ParserDialogInterface = ParserDialog
}
