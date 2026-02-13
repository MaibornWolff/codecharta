package de.maibornwolff.codecharta.analysers.importers.dependacharta

import com.google.gson.Gson
import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserDialogInterface
import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserInterface
import de.maibornwolff.codecharta.model.AttributeDescriptor
import de.maibornwolff.codecharta.model.AttributeGenerator
import de.maibornwolff.codecharta.model.AttributeType
import de.maibornwolff.codecharta.model.AttributeTypes
import de.maibornwolff.codecharta.model.ProjectBuilder
import de.maibornwolff.codecharta.serialization.ProjectSerializer
import de.maibornwolff.codecharta.util.CodeChartaConstants
import de.maibornwolff.codecharta.util.InputHelper
import picocli.CommandLine
import java.io.File
import java.io.IOException
import java.io.PrintStream

@CommandLine.Command(
    name = DependaChartaImporter.NAME,
    description = [DependaChartaImporter.DESCRIPTION],
    footer = [CodeChartaConstants.GENERIC_FOOTER]
)
class DependaChartaImporter(
    private val output: PrintStream = System.out
) : AnalyserInterface, AttributeGenerator {
    @CommandLine.Option(names = ["-h", "--help"], usageHelp = true, description = ["displays this help and exits"])
    private var help = false

    @CommandLine.Option(names = ["-o", "--output-file"], description = ["output File"])
    private var outputFile: String? = null

    @CommandLine.Option(names = ["-nc", "--not-compressed"], description = ["save uncompressed output File"])
    private var compress = true

    @CommandLine.Parameters(arity = "1", paramLabel = "FILE", description = ["DependaCharta .dc.json file"])
    private var inputFile: File? = null

    override val name = NAME
    override val description = DESCRIPTION

    companion object {
        const val NAME = "dependachartaimport"
        const val DESCRIPTION = "generates cc.json from DependaCharta .dc.json files"

        @JvmStatic
        fun main(args: Array<String>) {
            CommandLine(DependaChartaImporter()).execute(*args)
        }
    }

    @Throws(IOException::class)
    override fun call(): Unit? {
        if (!InputHelper.isInputValid(arrayOf(inputFile!!), canInputContainFolders = false)) {
            throw IllegalArgumentException("Input invalid file for DependaChartaImporter, stopping execution...")
        }

        val dcProject = Gson().fromJson(inputFile!!.reader(), DcProject::class.java)
        val edges = DcJsonParser.parseEdges(dcProject)

        val projectBuilder = ProjectBuilder()
        edges.forEach { projectBuilder.insertEdge(it) }
        projectBuilder.addAttributeTypes(attributeTypes)
        projectBuilder.addAttributeDescriptions(getAttributeDescriptorMaps())

        val project = projectBuilder.build()
        ProjectSerializer.serializeToFileOrStream(project, outputFile, output, compress)

        return null
    }

    private val attributeTypes: AttributeTypes
        get() {
            val types = mutableMapOf<String, AttributeType>()
            types["dependencies"] = AttributeType.ABSOLUTE
            return AttributeTypes(types, "edges")
        }

    override fun getDialog(): AnalyserDialogInterface = Dialog

    override fun isApplicable(resourceToBeParsed: String): Boolean {
        return resourceToBeParsed.endsWith(".dc.json")
    }

    override fun getAttributeDescriptorMaps(): Map<String, AttributeDescriptor> {
        return getAttributeDescriptors()
    }
}
