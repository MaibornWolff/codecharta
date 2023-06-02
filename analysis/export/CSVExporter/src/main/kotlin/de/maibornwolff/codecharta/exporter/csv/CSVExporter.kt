package de.maibornwolff.codecharta.exporter.csv

import com.univocity.parsers.csv.CsvWriter
import com.univocity.parsers.csv.CsvWriterSettings
import de.maibornwolff.codecharta.model.Node
import de.maibornwolff.codecharta.model.Path
import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import de.maibornwolff.codecharta.tools.interactiveparser.InteractiveParser
import de.maibornwolff.codecharta.tools.interactiveparser.ParserDialogInterface
import de.maibornwolff.codecharta.tools.interactiveparser.util.InteractiveParserHelper
import de.maibornwolff.codecharta.util.InputHelper
import picocli.CommandLine
import java.io.BufferedWriter
import java.io.File
import java.io.FileWriter
import java.io.IOException
import java.io.OutputStreamWriter
import java.io.Writer
import java.util.concurrent.Callable

@CommandLine.Command(
    name = InteractiveParserHelper.CSVExporterConstants.name,
    description = [InteractiveParserHelper.CSVExporterConstants.description],
    footer = [InteractiveParserHelper.GeneralConstants.GenericFooter]
)
class CSVExporter : Callable<Void>, InteractiveParser {

    @CommandLine.Option(names = ["-h", "--help"], usageHelp = true, description = ["displays this help and exits"])
    private var help = false

    @CommandLine.Parameters(arity = "1..*", paramLabel = "FILE", description = ["json files"])
    private var sources: Array<File> = arrayOf()

    @CommandLine.Option(names = ["-o", "--output-file"], description = ["output File (or empty for stdout)"])
    private var outputFile = ""

    @CommandLine.Option(names = ["--depth-of-hierarchy"], description = ["depth of the hierarchy"])
    private var maxHierarchy: Int = 10

    private fun writer(): Writer {
        return if (outputFile.isEmpty()) {
            OutputStreamWriter(System.out)
        } else {
            BufferedWriter(FileWriter(outputFile))
        }
    }

    @Throws(IOException::class)
    override fun call(): Void? {
        if (maxHierarchy < 0) {
            throw IllegalArgumentException("depth-of-hierarchy must not be negative")
        }

        if (!InputHelper.isInputValid(sources, canInputContainFolders = false)) {
            System.err.println("Input invalid file for CSVExporter, stopping execution...")
            return null
        }

        val projects = sources.map { ProjectDeserializer.deserializeProject(it.inputStream()) }

        projects.forEach { writeUsingWriter(it, writer()) }

        return null
    }

    private fun writeUsingWriter(project: Project, outputWriter: Writer) {
        val settings = CsvWriterSettings()
        val writer = CsvWriter(outputWriter, settings)

        val attributeNames: List<String> = project.rootNode.nodes.flatMap { it.value.attributes.keys }.distinct()

        val header = listOf("path", "name", "type")
            .plus(attributeNames)
            .plus(List(maxHierarchy, { "dir$it" }))

        writer.writeHeaders(header)

        project.rootNode.nodes.forEach({ path: Path, node: Node -> writer.writeRow(row(path, node, attributeNames)) })

        writer.close()
    }

    private fun row(path: Path, node: Node, attributeNames: List<String>): List<String> {
        val values: List<String> = node.toAttributeList(attributeNames)

        val rowWithoutDirs = listOf(path.toPath, node.name, node.type.toString())
            .plus(values)
        val dirs = path.edgesList.dropLast(1)

        return when {
            values.distinct().none { !it.isBlank() } -> listOf()
            dirs.size < maxHierarchy -> rowWithoutDirs.plus(dirs).plus(
                List(maxHierarchy - dirs.size, { "" })
            )
            else -> rowWithoutDirs.plus(dirs.subList(0, maxHierarchy))
        }
    }

    companion object {
        @JvmStatic
        fun main(args: Array<String>) {
            CommandLine(CSVExporter()).execute()
        }
    }

    override fun getDialog(): ParserDialogInterface = ParserDialog
    override fun isApplicable(resourceToBeParsed: String): Boolean {
        return false
    }

    override fun getName(): String {
        return InteractiveParserHelper.CSVExporterConstants.name
    }
}

private fun Node.toAttributeList(attributeNames: List<String>): List<String> {
    return attributeNames.map { this.attributes[it]?.toString() ?: "" }
}

private val Path.toPath: String
    get() {
        return this.edgesList.joinToString("/")
    }
