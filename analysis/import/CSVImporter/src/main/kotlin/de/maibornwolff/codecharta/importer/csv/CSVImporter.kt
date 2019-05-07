package de.maibornwolff.codecharta.importer.csv

import de.maibornwolff.codecharta.serialization.ProjectSerializer
import picocli.CommandLine
import java.io.*
import java.util.concurrent.Callable

@CommandLine.Command(
        name = "csvimport",
        description = ["generates cc.json from csv with header"],
        footer = ["Copyright(c) 2018, MaibornWolff GmbH"]
)
class CSVImporter: Callable<Void> {

    @CommandLine.Option(names = ["-h", "--help"], usageHelp = true, description = ["displays this help and exits"])
    private var help = false

    @CommandLine.Option(names = ["-d", "--delimeter"], description = ["delimeter in csv file"])
    private var csvDelimiter = ','

    @CommandLine.Option(names = ["-p", "--projectName"], description = ["project name"])
    private var projectName = "SCMLogParser"

    @CommandLine.Option(names = ["--pathSeparator"], description = ["path separator (default = '/')"])
    private var pathSeparator = '/'

    @CommandLine.Option(names = ["-o", "--outputFile"], description = ["output File (or empty for stdout)"])
    private var outputFile: File? = null

    @CommandLine.Parameters(arity = "1..*", paramLabel = "FILE", description = ["sourcemonitor csv files"])
    private var files: List<File> = mutableListOf()

    @Throws(IOException::class)
    override fun call(): Void? {
        val csvProjectBuilder = CSVProjectBuilder(projectName, pathSeparator, csvDelimiter)
        files.map { it.inputStream() }.forEach<InputStream> { csvProjectBuilder.parseCSVStream(it) }
        val project = csvProjectBuilder.build()
        ProjectSerializer.serializeProject(project, writer())

        return null
    }

    private fun writer(): Writer {
        return if (outputFile == null) {
            OutputStreamWriter(System.out)
        } else {
            BufferedWriter(FileWriter(outputFile))
        }
    }

    companion object {
        @JvmStatic
        fun main(args: Array<String>) {
            CommandLine.call(CSVImporter(), System.out, *args)
        }
    }
}

