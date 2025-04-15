package de.maibornwolff.codecharta.analysers.importers.csv

import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserDialogInterface
import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserInterface
import de.maibornwolff.codecharta.analysers.analyserinterface.util.CodeChartaConstants
import de.maibornwolff.codecharta.model.AttributeDescriptor
import de.maibornwolff.codecharta.model.AttributeGenerator
import de.maibornwolff.codecharta.serialization.ProjectSerializer
import de.maibornwolff.codecharta.util.InputHelper
import picocli.CommandLine
import java.io.File
import java.io.IOException
import java.io.InputStream
import java.io.PrintStream

@CommandLine.Command(
    name = CSVImporter.NAME,
    description = [CSVImporter.DESCRIPTION],
    footer = [CodeChartaConstants.GENERIC_FOOTER]
)
class CSVImporter(
    private val output: PrintStream = System.out
) : AnalyserInterface, AttributeGenerator {
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

    override val name = NAME
    override val description = DESCRIPTION

    companion object {
        const val NAME = "csvimport"
        const val DESCRIPTION = "generates cc.json from csv with header"

        @JvmStatic
        fun main(args: Array<String>) {
            CommandLine(CSVImporter()).execute(*args)
        }
    }

    @Throws(IOException::class)
    override fun call(): Unit? {
        if (!InputHelper.isInputValid(files.toTypedArray(), canInputContainFolders = false)) {
            throw IllegalArgumentException("Input invalid file for CSVImporter, stopping execution...")
        }

        val csvProjectBuilder = CSVProjectBuilder(pathSeparator, csvDelimiter, pathColumnName)
        files.map { it.inputStream() }.forEach<InputStream> { csvProjectBuilder.parseCSVStream(it) }
        val project = csvProjectBuilder.build()

        ProjectSerializer.serializeToFileOrStream(project, outputFile, output, compress)

        return null
    }

    override fun getDialog(): AnalyserDialogInterface = Dialog

    override fun isApplicable(resourceToBeParsed: String): Boolean {
        return false
    }

    override fun getAttributeDescriptorMaps(): Map<String, AttributeDescriptor> {
        return getAttributeDescriptors()
    }
}
