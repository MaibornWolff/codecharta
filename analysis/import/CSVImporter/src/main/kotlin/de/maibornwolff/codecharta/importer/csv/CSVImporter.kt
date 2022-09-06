package de.maibornwolff.codecharta.importer.csv

import de.maibornwolff.codecharta.serialization.ProjectSerializer
import de.maibornwolff.codecharta.tools.interactiveparser.InteractiveParser
import de.maibornwolff.codecharta.tools.interactiveparser.ParserDialogInterface
import picocli.CommandLine
import java.io.File
import java.io.IOException
import java.io.InputStream
import java.io.PrintStream
import java.util.concurrent.Callable

@CommandLine.Command(
    name = "csvimport",
    description = ["generates cc.json from csv with header"],
    footer = ["Copyright(c) 2022, MaibornWolff GmbH"]
)
class CSVImporter(
    private val output: PrintStream = System.out
) : Callable<Void>, InteractiveParser {

    @CommandLine.Option(names = ["-h", "--help"], usageHelp = true, description = ["displays this help and exits"])
    private var help = false

    @CommandLine.Option(names = ["-d", "--delimiter"], description = ["delimiter in csv file"])
    private var csvDelimiter = ','

    @CommandLine.Option(names = ["--path-separator"], description = ["path separator (default = '/')"])
    private var pathSeparator = '/'

    @CommandLine.Option(names = ["-nc", "--not-compressed"], description = ["save uncompressed output File"])
    private var compress = true

    @CommandLine.Option(names = ["-o", "--output-file"], description = ["output File"])
    private var outputFile: String? = null

    @CommandLine.Parameters(arity = "1..*", paramLabel = "FILE", description = ["sourcemonitor csv files"])
    private var files: List<File> = mutableListOf()

    @CommandLine.Option(names = ["--path-column-name"], description = ["name of path column"])
    private var pathColumnName: String = "path"

    @Throws(IOException::class)
    override fun call(): Void? {

        val csvProjectBuilder = CSVProjectBuilder(pathSeparator, csvDelimiter, pathColumnName)
        files.map { it.inputStream() }.forEach<InputStream> { csvProjectBuilder.parseCSVStream(it) }
        val project = csvProjectBuilder.build()

        ProjectSerializer.serializeToFileOrStream(project, outputFile, output, compress)

        return null
    }

    companion object {
        @JvmStatic
        fun main(args: Array<String>) {
            CommandLine.call(CSVImporter(), System.out, *args)
        }
    }

    override fun getDialog(): ParserDialogInterface = ParserDialog
}
