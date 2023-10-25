package de.maibornwolff.codecharta.importer.metricgardenerimporter

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.maibornwolff.codecharta.importer.metricgardenerimporter.json.MetricGardenerProjectBuilder
import de.maibornwolff.codecharta.importer.metricgardenerimporter.model.MetricGardenerNodes
import de.maibornwolff.codecharta.serialization.ProjectSerializer
import de.maibornwolff.codecharta.tools.interactiveparser.InteractiveParser
import de.maibornwolff.codecharta.tools.interactiveparser.ParserDialogInterface
import de.maibornwolff.codecharta.tools.interactiveparser.util.InteractiveParserHelper
import de.maibornwolff.codecharta.util.InputHelper
import de.maibornwolff.codecharta.util.ResourceSearchHelper
import jdk.jshell.spi.ExecutionControl.InternalException
import picocli.CommandLine
import java.io.File
import java.io.IOException
import java.io.PrintStream
import java.nio.charset.Charset
import java.util.concurrent.Callable

@CommandLine.Command(
    name = InteractiveParserHelper.MetricGardenerImporterConstants.name,
    description = [InteractiveParserHelper.MetricGardenerImporterConstants.description],
    footer = [InteractiveParserHelper.GeneralConstants.GenericFooter]
)

class MetricGardenerImporter(
    private val output: PrintStream = System.out
) : Callable<Void>, InteractiveParser {

    private val mapper = jacksonObjectMapper()

    @CommandLine.Option(
        names = ["-h", "--help"], usageHelp = true,
        description = ["Specify: path/to/input/folder/or/file -o path/to/outputfile.json"]
    )
    private var help = false

    @CommandLine.Parameters(
        arity = "1", paramLabel = "FOLDER or FILE",
        description = ["path for project folder or code file"]
    )
    private var inputFile: File? = null

    @CommandLine.Option(names = ["-j", "--is-json-file"], description = ["Input file is a MetricGardener JSON file"])
    private var isJsonFile: Boolean = false

    @CommandLine.Option(names = ["-o", "--output-file"], description = ["output File"])
    private var outputFile: String? = null

    @CommandLine.Option(names = ["-nc", "--not-compressed"], description = ["save uncompressed output File"])
    private var compress = true

    @Throws(IOException::class)
    override fun call(): Void? {
        if (!InputHelper.isInputValidAndNotNull(arrayOf(inputFile), canInputContainFolders = true)) {
            throw IllegalArgumentException("Input invalid file for MetricGardenerImporter, stopping execution...")
        }

        if (!isJsonFile) {
            val tempMgOutput = File.createTempFile("MGOutput", ".json")
            tempMgOutput.deleteOnExit()

            val npm = if (isWindows()) "npm.cmd" else "npm"
            val commandToExecute = listOf(
                npm, "exec", "-y", "metric-gardener", "--", "parse",
                inputFile!!.absolutePath, "--output-path", tempMgOutput.absolutePath
            )
            println("Running metric gardener, this might take some time for larger inputs...")
            val processExitCode = ProcessBuilder(commandToExecute)
                    // Not actively discarding or redirecting the output of MetricGardener loses performance on larger folders
                    .redirectOutput(ProcessBuilder.Redirect.DISCARD)
                    .redirectError(ProcessBuilder.Redirect.INHERIT)
                    .start()
                    .waitFor()
            inputFile = tempMgOutput
            if (processExitCode != 0) {
                throw InternalException("Error while executing metric gardener! Process returned with status $processExitCode.")
            }
        }
        val metricGardenerNodes: MetricGardenerNodes =
            mapper.readValue(inputFile!!.reader(Charset.defaultCharset()), MetricGardenerNodes::class.java)
        val metricGardenerProjectBuilder = MetricGardenerProjectBuilder(metricGardenerNodes)
        val project = metricGardenerProjectBuilder.build()

        ProjectSerializer.serializeToFileOrStream(project, outputFile, output, compress)

        return null
    }

    companion object {
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

    private fun isWindows(): Boolean {
        return System.getProperty("os.name").contains("win", ignoreCase = true)
    }

    override fun getDialog(): ParserDialogInterface = ParserDialog
    override fun isApplicable(resourceToBeParsed: String): Boolean {
        val supportedLanguageFileEndings = getSupportedLanguageFileEndings()
        println("Checking if MetricGardener is applicable...")
        return ResourceSearchHelper.isFileWithOneOrMoreOfEndingsPresent(resourceToBeParsed, supportedLanguageFileEndings)
    }

    override fun getName(): String {
        return InteractiveParserHelper.MetricGardenerImporterConstants.name
    }
}
