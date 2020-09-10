package de.maibornwolff.codecharta.importer.tokeiimporter

import com.google.gson.JsonElement
import com.google.gson.JsonParser
import de.maibornwolff.codecharta.importer.tokeiimporter.strategy.ImporterStrategy
import de.maibornwolff.codecharta.importer.tokeiimporter.strategy.TokeiInnerStrategy
import de.maibornwolff.codecharta.importer.tokeiimporter.strategy.TokeiTwelveStrategy
import de.maibornwolff.codecharta.model.AttributeType
import de.maibornwolff.codecharta.model.AttributeTypes
import de.maibornwolff.codecharta.model.ProjectBuilder
import de.maibornwolff.codecharta.serialization.ProjectSerializer
import de.maibornwolff.codecharta.serialization.mapLines
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking
import mu.KotlinLogging
import picocli.CommandLine
import java.io.BufferedWriter
import java.io.File
import java.io.FileWriter
import java.io.IOException
import java.io.InputStream
import java.io.OutputStreamWriter
import java.io.PrintStream
import java.io.Writer
import java.util.concurrent.Callable

@CommandLine.Command(
    name = "tokeiimporter",
    description = ["generates cc.json from tokei json"],
    footer = ["Copyright(c) 2020, MaibornWolff GmbH"]
)
class TokeiImporter(
    private val input: InputStream = System.`in`,
    private val output: PrintStream = System.out,
    private val error: PrintStream = System.err
) : Callable<Void> {

    private val logger = KotlinLogging.logger {}

    private val attributeTypes = AttributeTypes(type = "nodes")
        .add("rloc", AttributeType.absolute)
        .add("loc", AttributeType.absolute)
        .add("empty_lines", AttributeType.absolute)
        .add("comment_lines", AttributeType.absolute)

    private lateinit var projectBuilder: ProjectBuilder

    @CommandLine.Option(names = ["-h", "--help"], usageHelp = true, description = ["displays this help and exits"])
    private var help = false

    @CommandLine.Option(names = ["-r", "--root-name"], description = ["root folder as specified when executing tokei"])
    private var rootName = "."

    @CommandLine.Option(names = ["--path-separator"], description = ["path separator (default = '/')"])
    private var pathSeparator = "/"

    @CommandLine.Option(names = ["-o", "--output-file"], description = ["output File (or empty for stdout)"])
    private var outputFile: File? = null

    @CommandLine.Option(names = ["-c"], description = ["compress output File to gzip format"])
    private var compress = false

    @CommandLine.Parameters(arity = "0..1", paramLabel = "FILE", description = ["tokei generated json"])
    private var file: File? = null

    private lateinit var importerStrategy: ImporterStrategy

    @Throws(IOException::class)
    override fun call(): Void? {
        print(" ")
        projectBuilder = ProjectBuilder()
        val root = getInput() ?: return null
        runBlocking(Dispatchers.Default) {
            determineImporterStrategy(root)
            val languageSummaries = importerStrategy.getLanguageSummaries(root)
            importerStrategy.buildCCJson(languageSummaries, projectBuilder)
        }
        projectBuilder.addAttributeTypes(attributeTypes)

        val filePath = outputFile?.absolutePath ?: "notSpecified"

        if (compress && filePath != "notSpecified") ProjectSerializer.serializeAsCompressedFile(
            projectBuilder.build(),
            filePath
        ) else ProjectSerializer.serializeProject(projectBuilder.build(), writer())

        return null
    }

    private fun determineImporterStrategy(root: JsonElement) {
        val json = root.asJsonObject
        importerStrategy = if (json.has(TOP_LEVEL_OBJECT)) {
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
                    if (file!!.isFile) {
                        val bufferedReader = file!!.bufferedReader()
                        root = JsonParser().parse(bufferedReader)
                    } else {
                        logger.error("${file!!.name} has not been found.")
                    }
                }
            } else {
                launch {
                    val projectString: String = input.mapLines { it }.joinToString(separator = "") { it }
                    if (projectString.isNotEmpty()) {
                        root = JsonParser().parse(projectString)
                    } else {
                        logger.error("Neither source file nor piped input found.")
                    }
                }
            }
        }

        return root
    }

    private fun writer(): Writer {
        return if (outputFile == null) {
            OutputStreamWriter(output)
        } else {
            BufferedWriter(FileWriter(outputFile!!))
        }
    }

    companion object {
        @JvmStatic
        fun main(args: Array<String>) {
            CommandLine.call(TokeiImporter(), System.out, *args)
        }

        @JvmStatic
        fun mainWithInOut(input: InputStream, output: PrintStream, error: PrintStream, args: Array<String>) {
            CommandLine.call(TokeiImporter(input, output, error), output, *args)
        }

        @JvmStatic
        val TOP_LEVEL_OBJECT = "inner"
    }
}
