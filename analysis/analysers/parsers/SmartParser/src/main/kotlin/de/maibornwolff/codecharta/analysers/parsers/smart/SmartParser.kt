package de.maibornwolff.codecharta.analysers.parsers.smart

import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserDialogInterface
import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserInterface
import de.maibornwolff.codecharta.analysers.analyserinterface.util.CodeChartaConstants
import de.maibornwolff.codecharta.analysers.parsers.smart.metriccollectors.TypescriptCollector
import de.maibornwolff.codecharta.analysers.parsers.smart.metricqueries.typescript.TypescriptQueries
import de.maibornwolff.codecharta.model.AttributeDescriptor
import de.maibornwolff.codecharta.model.AttributeGenerator
import java.io.InputStream
import java.io.PrintStream
import picocli.CommandLine
import java.io.File
import org.treesitter.*

@CommandLine.Command(
    name = SmartParser.NAME,
    description = [SmartParser.DESCRIPTION],
    footer = [CodeChartaConstants.GENERIC_FOOTER]
)
class SmartParser(
    private val input: InputStream = System.`in`,
    private val output: PrintStream = System.out,
    private val error: PrintStream = System.err
) : AnalyserInterface, AttributeGenerator {
    @CommandLine.Option(names = ["-h", "--help"], usageHelp = true, description = ["displays this help and exits"])
    private var help = false

    @CommandLine.Parameters(arity = "1", paramLabel = "FILE or FOLDER", description = ["file/project to parse"])
    private var inputFile: File? = null

    @CommandLine.Option(names = ["-o", "--output-file"], description = ["output File (or empty for stdout)"])
    private var outputFile: String? = null


    @CommandLine.Option(names = ["--verbose"], description = ["verbose mode"])
    private var verbose = false

    @CommandLine.Option(names = ["-nc", "--not-compressed"], description = ["save uncompressed output File"])
    private var compress = true

    // TODO: add more options when the skeleton walks


    override val name = NAME
    override val description = DESCRIPTION

    companion object {
        const val NAME = "smartparser"
        const val DESCRIPTION = "generates cc.json from projects or source code files"

        private val DEFAULT_EXCLUDES = arrayOf("/out/", "/build/", "/target/", "/dist/", "/resources/", "/\\..*")
    }


    override fun call(): Unit? {
        //TODO: this function should handle going through the files and call the correct parsers for each file type

        println("calling smartParser...")

        val fileContent = inputFile!!.readText()
        val nodesTree = parseCode(fileContent)

        val complexity = TypescriptCollector.getMetricFromQuery(nodesTree, TypescriptQueries.complexityQuery)

        println("---------$complexity------------")

        return null
    }

    private fun parseCode(typescriptCode: String): TSNode {
        val parser = TSParser()
        parser.language = TreeSitterTypescript()
        val tree = parser.parseString(null, typescriptCode)
        return tree.rootNode
    }

    override fun getDialog(): AnalyserDialogInterface = Dialog

    override fun isApplicable(resourceToBeParsed: String): Boolean {
        TODO("Not yet implemented")
    }

    override fun getAttributeDescriptorMaps(): Map<String, AttributeDescriptor> {
        TODO("Not yet implemented")
    }

}
