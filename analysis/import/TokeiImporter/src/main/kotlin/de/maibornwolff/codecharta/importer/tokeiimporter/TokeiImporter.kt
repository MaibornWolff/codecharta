package de.maibornwolff.codecharta.importer.tokeiimporter

import picocli.CommandLine
import java.io.*
import java.util.concurrent.Callable

@CommandLine.Command(
        name = "tokeiimporter",
        description = ["generates cc.json from tokei json"],
        footer = ["Copyright(c) 2019, MaibornWolff GmbH"]
)
class TokeiImporter : Callable<Void> {

    @CommandLine.Option(names = ["-h", "--help"], usageHelp = true, description = ["displays this help and exits"])
    private var help = false

    @CommandLine.Option(names = ["-p", "--projectName"], description = ["project name"])
    private var projectName = "TokeiImporter"

    @CommandLine.Option(names = ["--pathSeparator"], description = ["path separator (default = '/')"])
    private var pathSeparator = '/'

    @CommandLine.Option(names = ["-o", "--outputFile"], description = ["output File (or empty for stdout)"])
    private var outputFile: File? = null

    @CommandLine.Parameters(paramLabel = "FILE", description = ["sourcemonitor csv file"])
    private var files: File? = null

    @Throws(IOException::class)
    override fun call(): Void? {
        //val csvProjectBuilder = CSVProjectBuilder(projectName, pathSeparator, csvDelimiter)
        //files.map { it.inputStream() }.forEach<InputStream> { csvProjectBuilder.parseCSVStream(it) }
        //val project = csvProjectBuilder.build()
        //ProjectSerializer.serializeProject(project, writer())

        return null
    }

    private fun writer(): Writer {
        return if (outputFile == null) {
            OutputStreamWriter(System.out)
        } else {
            BufferedWriter(FileWriter(outputFile!!))
        }
    }

    companion object {
        @JvmStatic
        fun main(args: Array<String>) {
            CommandLine.call(TokeiImporter(), System.out, *args)
        }
    }
}

