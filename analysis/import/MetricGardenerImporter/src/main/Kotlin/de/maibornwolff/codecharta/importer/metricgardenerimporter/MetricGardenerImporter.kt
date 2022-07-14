package de.maibornwolff.codecharta.importer.metricgardenerimporter

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.maibornwolff.codecharta.importer.metricgardenerimporter.model.Nodes
import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import de.maibornwolff.codecharta.tools.interactiveparser.InteractiveParser
import de.maibornwolff.codecharta.tools.interactiveparser.ParserDialogInterface
import picocli.CommandLine
import java.io.BufferedWriter
import java.io.File
import java.io.FileWriter
import java.io.IOException
import java.io.PrintStream
import java.nio.charset.Charset
import java.nio.file.Paths
import java.util.concurrent.Callable

@CommandLine.Command(name = "metricgardenerimport",
        description = ["generates a cc.json file from a project parsed with metric-gardener"],
        footer = ["Copyright(c) 2022, MaibornWolff GmbH"])

class MetricGardenerImporter : Callable<Void>, InteractiveParser {

    private val error: PrintStream = System.err

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
            error.println("Current working directory = $path")
            error.println("Could not find $inputFile")
            return null
        }
        // 1. Inputfile to Data class - deserialize Project
        val pipedProject = ProjectDeserializer.deserializeProject(inputFile.reader(Charset.defaultCharset()))
        val nodes: Nodes = mapper.readValue(inputFile.reader(Charset.defaultCharset()), Nodes::class.java)
        // 2. übersetzen
        // 3. serialisieren (müsste es schon geben)
        val outputWriter = BufferedWriter(FileWriter(outputFile))

        val outputFilePath = outputFile.absolutePath
        // outputWriter.write(mapper.)
        return null
    }

    override fun getDialog(): ParserDialogInterface = ParserDialog
}
