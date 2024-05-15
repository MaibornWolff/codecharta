package de.maibornwolff.codecharta.importer.metricgardenerimporter

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.maibornwolff.codecharta.importer.metricgardenerimporter.json.MetricGardenerProjectBuilder
import de.maibornwolff.codecharta.importer.metricgardenerimporter.model.MetricGardenerNodes
import de.maibornwolff.codecharta.model.AttributeDescriptor
import de.maibornwolff.codecharta.model.AttributeGenerator
import de.maibornwolff.codecharta.serialization.ProjectSerializer
import de.maibornwolff.codecharta.tools.interactiveparser.InteractiveParser
import de.maibornwolff.codecharta.tools.interactiveparser.ParserDialogInterface
import de.maibornwolff.codecharta.tools.interactiveparser.util.CodeChartaConstants
import de.maibornwolff.codecharta.util.InputHelper
import de.maibornwolff.codecharta.util.ResourceSearchHelper
import picocli.CommandLine
import java.io.File
import java.io.IOException
import java.io.PrintStream
import java.nio.charset.Charset
import java.util.concurrent.Callable

@CommandLine.Command(
    name = MetricGardenerImporter.NAME,
    description = [MetricGardenerImporter.DESCRIPTION],
    footer = [CodeChartaConstants.General.GENERIC_FOOTER]
)
class MetricGardenerImporter(
    private val output: PrintStream = System.out
) : Callable<Unit>, InteractiveParser, AttributeGenerator {
    private val mapper = jacksonObjectMapper()

    @CommandLine.Option(
        names = ["-h", "--help"],
        usageHelp = true,
        description = ["Specify: path/to/input/folder/or/file -o path/to/outputfile.json"]
    )
    private var help = false

    @CommandLine.Parameters(
        arity = "1",
        paramLabel = "FOLDER or FILE",
        description = ["path for project folder or code file"]
    )
    private var inputFile: File? = null

    @CommandLine.Option(names = ["-j", "--is-json-file"], description = ["Input file is a MetricGardener JSON file"])
    private var isJsonFile: Boolean = false

    @CommandLine.Option(names = ["-o", "--output-file"], description = ["output File"])
    private var outputFile: String? = null

    @CommandLine.Option(names = ["-nc", "--not-compressed"], description = ["save uncompressed output File"])
    private var compress = true

    override val name = NAME
    override val description = DESCRIPTION

    companion object {
        const val NAME = "metricgardenerimport"
        const val DESCRIPTION =
            "generates a cc.json file from a project parsed with metric-gardener. " +
                "Caution - this parser is still experimental and may take a long time to parse code!"

        @JvmStatic
        fun main(args: Array<String>) {
            CommandLine(MetricGardenerImporter()).execute(*args)
        }

        @JvmStatic
        fun getSupportedLanguageFileEndings(): List<String> {
            // If needed: Add more file endings for each supported language
            return listOf(".go", ".php", ".ts", ".cs", ".cpp", ".java", ".js", ".kt", ".py")
        }
    }

    @Throws(IOException::class)
    override fun call(): Unit? {
        if (!InputHelper.isInputValidAndNotNull(arrayOf(inputFile), canInputContainFolders = true)) {
            throw IllegalArgumentException("Input invalid file for MetricGardenerImporter, stopping execution...")
        }

        require(isJsonFile) { "Direct metric-gardener execution has been temporarily disabled." }

        val metricGardenerNodes: MetricGardenerNodes =
            mapper.readValue(inputFile!!.reader(Charset.defaultCharset()), MetricGardenerNodes::class.java)
        val metricGardenerProjectBuilder = MetricGardenerProjectBuilder(metricGardenerNodes)
        val project = metricGardenerProjectBuilder.build()

        ProjectSerializer.serializeToFileOrStream(project, outputFile, output, compress)

        return null
    }

    override fun getDialog(): ParserDialogInterface = ParserDialog

    override fun isApplicable(resourceToBeParsed: String): Boolean {
        val supportedLanguageFileEndings = getSupportedLanguageFileEndings()
        println("Checking if MetricGardener is applicable...")
        return ResourceSearchHelper.isFileWithOneOrMoreOfEndingsPresent(
            resourceToBeParsed,
            supportedLanguageFileEndings
        )
    }

    override fun getAttributeDescriptorMaps(): Map<String, AttributeDescriptor> {
        return getAttributeDescriptors()
    }
}
