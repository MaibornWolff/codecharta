package de.maibornwolff.codecharta.analysers.importers.tokei

import com.google.gson.JsonElement
import com.google.gson.JsonParser
import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserDialogInterface
import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserInterface
import de.maibornwolff.codecharta.analysers.analyserinterface.util.CodeChartaConstants
import de.maibornwolff.codecharta.analysers.importers.tokei.strategy.ImporterStrategy
import de.maibornwolff.codecharta.analysers.importers.tokei.strategy.TokeiInnerStrategy
import de.maibornwolff.codecharta.analysers.importers.tokei.strategy.TokeiTwelveStrategy
import de.maibornwolff.codecharta.model.AttributeDescriptor
import de.maibornwolff.codecharta.model.AttributeGenerator
import de.maibornwolff.codecharta.model.AttributeType
import de.maibornwolff.codecharta.model.AttributeTypes
import de.maibornwolff.codecharta.model.ProjectBuilder
import de.maibornwolff.codecharta.serialization.ProjectInputReader
import de.maibornwolff.codecharta.serialization.ProjectSerializer
import de.maibornwolff.codecharta.util.InputHelper
import de.maibornwolff.codecharta.util.Logger
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking
import picocli.CommandLine
import java.io.File
import java.io.IOException
import java.io.InputStream
import java.io.PrintStream
import java.io.PrintWriter

@CommandLine.Command(
    name = TokeiImporter.NAME,
    description = [TokeiImporter.DESCRIPTION],
    footer = [CodeChartaConstants.GENERIC_FOOTER]
)
class TokeiImporter(
    private val input: InputStream = System.`in`,
    private val output: PrintStream = System.out,
    private val error: PrintStream = System.err
) : AnalyserInterface, AttributeGenerator {
    private val attributeTypes =
        AttributeTypes(type = "nodes").add("rloc", AttributeType.ABSOLUTE).add("loc", AttributeType.ABSOLUTE)
            .add("empty_lines", AttributeType.ABSOLUTE).add("comment_lines", AttributeType.ABSOLUTE)

    private lateinit var projectBuilder: ProjectBuilder

    @CommandLine.Option(names = ["-h", "--help"], usageHelp = true, description = ["displays this help and exits"])
    private var help = false

    @CommandLine.Option(names = ["-r", "--root-name"], description = ["root folder as specified when executing tokei"])
    private var rootName = "."

    @CommandLine.Option(
        names = ["--path-separator"],
        description = ["path separator, leave empty for auto-detection (default = '')"]
    )
    private var pathSeparator = ""

    @CommandLine.Option(names = ["-o", "--output-file"], description = ["output File "])
    private var outputFile: String? = null

    @CommandLine.Option(names = ["-nc", "--not-compressed"], description = ["save uncompressed output File"])
    private var compress = true

    @CommandLine.Parameters(arity = "0..1", paramLabel = "FILE", description = ["tokei generated json"])
    private var file: File? = null

    private lateinit var importerStrategy: ImporterStrategy

    override val name = NAME
    override val description = DESCRIPTION

    companion object {
        const val NAME = "tokeiimporter"
        const val DESCRIPTION = "generates cc.json from tokei json"

        @JvmStatic
        fun mainWithInOut(input: InputStream, output: PrintStream, error: PrintStream, args: Array<String>) {
            CommandLine(TokeiImporter(input, output, error)).setOut(PrintWriter(output)).execute(*args)
        }

        @JvmStatic
        val TOP_LEVEL_OBJECT = "inner"
    }

    @Throws(IOException::class)
    override fun call(): Unit? {
        logExecutionStartedSyncSignal()

        projectBuilder = ProjectBuilder()
        val root = getInput() ?: return null
        unescapeWindowsPathSeparator()
        runBlocking(Dispatchers.Default) {
            determineImporterStrategy(root)
            val languageSummaries = importerStrategy.getLanguageSummaries(root)

            importerStrategy.buildCCJson(languageSummaries, projectBuilder)
        }
        projectBuilder.addAttributeTypes(attributeTypes)
        projectBuilder.addAttributeDescriptions(getAttributeDescriptors())
        val project = projectBuilder.build()

        ProjectSerializer.serializeToFileOrStream(project, outputFile, output, compress)

        return null
    }

    private fun determineImporterStrategy(root: JsonElement) {
        val json = root.asJsonObject
        importerStrategy =
            if (json.has(TOP_LEVEL_OBJECT)) {
                TokeiInnerStrategy(rootName, pathSeparator)
            } else {
                TokeiTwelveStrategy(rootName, pathSeparator)
            }
    }

    private fun getInput(): JsonElement? {
        var root: JsonElement? = null
        runBlocking(Dispatchers.Default) {
            if (file != null) {
                launch {
                    if (InputHelper.isInputValid(arrayOf(file!!), canInputContainFolders = false)) {
                        val bufferedReader = file!!.bufferedReader()
                        root = JsonParser.parseReader(bufferedReader)
                    } else {
                        throw IllegalArgumentException("Input invalid file for TokeiImporter, stopping execution...")
                    }
                }
            } else {
                launch {
                    val projectString: String = ProjectInputReader.extractProjectString(input)
                    if (projectString.isNotEmpty()) {
                        root = JsonParser.parseString(projectString)
                    } else {
                        Logger.error { "Neither source file nor piped input found." }
                    }
                }
            }
        }

        return root
    }

    private fun unescapeWindowsPathSeparator() {
        if (pathSeparator == "\\\\") this.pathSeparator = "\\"
    }

    override fun getDialog(): AnalyserDialogInterface = Dialog

    override fun isApplicable(resourceToBeParsed: String): Boolean {
        return false
    }

    override fun getAttributeDescriptorMaps(): Map<String, AttributeDescriptor> {
        return getAttributeDescriptors()
    }
}
