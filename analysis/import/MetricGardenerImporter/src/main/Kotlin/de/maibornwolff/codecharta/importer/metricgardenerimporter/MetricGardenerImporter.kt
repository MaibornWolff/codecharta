package de.maibornwolff.codecharta.importer.metricgardenerimporter

import picocli.CommandLine
import java.io.File
import java.util.concurrent.Callable

@CommandLine.Command(
        name = "metricgardenerimport",
        description = ["generates a cc.json file from a project parsed with metric-gardener"],
        footer = ["Copyright(c) 2022, MaibornWolff GmbH"]
)

class MetricGardenerImporter: Callable<Void> {

    @CommandLine.Option(names = ["-h", "--help"], usageHelp = true, description = [
      "Specify: path/to/input/folder/or/file -o path/to/outputfile.json"])
    private var help = false

    @CommandLine.Option(names = ["-nc", "--not-compressed"], description = ["save uncompressed output File"])
    private var compress = true

    @CommandLine.Parameters(arity = "1", paramLabel = "FOLDER or FILE", description = ["project folder or code file"])
    private var inputFile: File = File("")

    @CommandLine.Option(names = ["-o", "--output-file"], description = ["path for the outputfile"])
    private var outputFile: File? = null



    override fun call(): Void {
        TODO("Not yet implemented")
    }
}
