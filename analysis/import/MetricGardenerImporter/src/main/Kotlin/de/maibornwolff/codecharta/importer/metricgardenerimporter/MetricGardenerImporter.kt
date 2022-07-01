package de.maibornwolff.codecharta.importer.metricgardenerimporter

import de.maibornwolff.codecharta.tools.interactiveparser.InteractiveParser
import de.maibornwolff.codecharta.tools.interactiveparser.ParserDialogInterface
import picocli.CommandLine
import java.io.File
import java.io.IOException
import java.io.InputStream
import java.util.concurrent.Callable

@CommandLine.Command(name = "metricgardenerimport",
        description = ["generates a cc.json file from a project parsed with metric-gardener"],
        footer = ["Copyright(c) 2022, MaibornWolff GmbH"])

class MetricGardenerImporter : Callable<Void>, InteractiveParser {

    @CommandLine.Option(names = ["-h", "--help"], usageHelp = true,
            description = ["Specify: path/to/input/folder/or/file -o path/to/outputfile.json"])
    private var help = false

    @CommandLine.Parameters(arity = "1", paramLabel = "FOLDER or FILE", description = ["path for project folder or code file"])
    private var inputFile: File = File("")

    @CommandLine.Parameters(arity = "1", paramLabel = "FOLDER or FILE", description = ["path for the outputfile"])
    private var outputFile: File = File("")

    @CommandLine.Option(names = ["-nc", "--not-compressed"], description = ["save uncompressed output File"])
    private var compress: Boolean = true

    @Throws(IOException::class)
    override fun call(): Void? {

        val metricGardenerInputFile: InputStream = inputFile.inputStream()
        println(metricGardenerInputFile)
        return null
    }

    override fun getDialog(): ParserDialogInterface = ParserDialog
}
