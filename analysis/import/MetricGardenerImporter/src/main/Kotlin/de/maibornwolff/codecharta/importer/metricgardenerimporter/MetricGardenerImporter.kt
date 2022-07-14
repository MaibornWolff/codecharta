package de.maibornwolff.codecharta.importer.metricgardenerimporter

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.maibornwolff.codecharta.importer.metricgardenerimporter.json.MetricGardenerProjectBuilder
import de.maibornwolff.codecharta.importer.metricgardenerimporter.model.MetricGardenerNodes
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

@CommandLine.Command(name = "metricgardenerimport",
        description = ["generates a cc.json file from a project parsed with metric-gardener"],
        footer = ["Copyright(c) 2022, MaibornWolff GmbH"])

class MetricGardenerImporter : Callable<Void>, InteractiveParser {

    private val logger = KotlinLogging.logger {}

    private val mapper = jacksonObjectMapper()

    @CommandLine.Option(names = ["-h", "--help"], usageHelp = true,
            description = ["Specify: path/to/input/folder/or/file -o path/to/outputfile.json"])
    private var help = false

    @CommandLine.Parameters(arity = "1", paramLabel = "FOLDER or FILE",
            description = ["path for project folder or code file"])
    private var inputFile: File = File("")

    @CommandLine.Parameters(arity = "1", paramLabel = "FOLDER or FILE", description = ["path for the outputfile"])
    private var outputFile: File = File("")

    @CommandLine.Option(names = ["-nc", "--not-compressed"], description = ["save uncompressed output File"])
    private var compress: Boolean = true

    @Throws(IOException::class)
    override fun call(): Void? {
        if (!inputFile.exists()) {
            val path = Paths.get("").toAbsolutePath().toString()
            logger.error { "Current working directory = $path" }
            logger.error { "Could not find $inputFile" }
            return null
        }
        val metricGardenerNodes: MetricGardenerNodes = mapper.readValue(inputFile.reader(Charset.defaultCharset()), MetricGardenerNodes::class.java)
        val metricGardenerProjectBuilder = MetricGardenerProjectBuilder(metricGardenerNodes)
        val project = metricGardenerProjectBuilder.build()
        val outputWriter = BufferedWriter(FileWriter(outputFile))
        //TODO: Compression handlen
        ProjectSerializer.serializeProject(project, outputWriter)

        return null
    }

    override fun getDialog(): ParserDialogInterface = ParserDialog
}
