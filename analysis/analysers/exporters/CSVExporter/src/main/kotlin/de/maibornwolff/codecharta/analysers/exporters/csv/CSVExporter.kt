package de.maibornwolff.codecharta.analysers.exporters.csv

import com.univocity.parsers.csv.CsvWriter
import com.univocity.parsers.csv.CsvWriterSettings
import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserDialogInterface
import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserInterface
import de.maibornwolff.codecharta.analysers.analyserinterface.util.CodeChartaConstants
import de.maibornwolff.codecharta.model.Node
import de.maibornwolff.codecharta.model.Path
import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.serialization.FileExtension
import de.maibornwolff.codecharta.serialization.OutputFileHandler
import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import de.maibornwolff.codecharta.util.InputHelper
import de.maibornwolff.codecharta.util.Logger
import picocli.CommandLine
import java.io.BufferedWriter
import java.io.File
import java.io.FileWriter
import java.io.IOException
import java.io.OutputStreamWriter
import java.io.Writer

@CommandLine.Command(
    name = CSVExporter.NAME,
    description = [CSVExporter.DESCRIPTION],
    footer = [CodeChartaConstants.GENERIC_FOOTER]
)
class CSVExporter : AnalyserInterface {
    @CommandLine.Option(names = ["-h", "--help"], usageHelp = true, description = ["displays this help and exits"])
    private var help = false

    @CommandLine.Parameters(arity = "1..*", paramLabel = "FILE or FOLDER", description = ["input file or folder"])
    private var sources: Array<File> = arrayOf()

    @CommandLine.Option(names = ["-o", "--output-file"], description = ["output File (or empty for stdout)"])
    private var outputFile = ""

    @CommandLine.Option(names = ["--depth-of-hierarchy"], description = ["depth of the hierarchy"])
    private var maxHierarchy: Int = 10

    override val name = NAME
    override val description = DESCRIPTION

    companion object {
        const val NAME = "csvexport"
        const val DESCRIPTION = "generates csv file with header"

        @JvmStatic
        fun main(args: Array<String>) {
            CommandLine(CSVExporter()).execute()
        }
    }

    private fun writer(append: Boolean): Writer {
        return if (outputFile.isEmpty()) {
            OutputStreamWriter(System.out)
        } else {
            BufferedWriter(FileWriter(outputFile, append))
        }
    }

    @Throws(IOException::class)
    override fun call(): Unit? {
        require(maxHierarchy >= 0) { "depth-of-hierarchy must not be negative" }

        require(InputHelper.isInputValid(sources, canInputContainFolders = true)) {
            "Invalid input file/folder for CSVExporter, stopping execution..."
        }

        val files = sources.flatMap {
            if (it.isDirectory) {
                it.listFiles { _, name -> name.endsWith(".cc.json") }
                    ?.toList()
                    ?: emptyList()
            } else {
                listOf(it)
            }
        }.toTypedArray()

        require(InputHelper.isInputValid(files, canInputContainFolders = false)) {
            "Invalid input file for CSVExporter, stopping execution..."
        }

        if (outputFile.isNotEmpty()) {
            outputFile = OutputFileHandler.checkAndFixFileExtension(outputFile, false, FileExtension.CSV)
        }

        val projects =
            files.map {
                ProjectDeserializer.deserializeProject(it.inputStream())
            }
        projects.forEachIndexed { index, project ->
            val append = index > 0
            writeUsingWriter(project, writer(append))
        }

        if (outputFile.isNotEmpty()) {
            val absoluteFilePath = File(outputFile).absolutePath
            Logger.info {
                "Created output file at $absoluteFilePath"
            }
        }

        return null
    }

    private fun writeUsingWriter(project: Project, outputWriter: Writer) {
        val settings = CsvWriterSettings()
        val writer = CsvWriter(outputWriter, settings)

        val attributeNames: List<String> =
            project.rootNode.nodes.flatMap {
                it.value.attributes.keys
            }.distinct()

        val header =
            listOf("path", "name", "type").plus(attributeNames).plus(
                List(maxHierarchy) {
                    "dir$it"
                }
            )

        writer.writeHeaders(header)

        project.rootNode.nodes.forEach { (path: Path, node: Node) -> writer.writeRow(row(path, node, attributeNames)) }

        writer.close()
    }

    private fun row(path: Path, node: Node, attributeNames: List<String>): List<String> {
        val values: List<String> = node.toAttributeList(attributeNames)

        val rowWithoutDirs = listOf(path.toPath, node.name, node.type.toString()).plus(values)
        val dirs = path.edgesList.dropLast(1)

        return when {
            values.distinct().none {
                it.isNotBlank()
            } -> listOf()

            dirs.size < maxHierarchy ->
                rowWithoutDirs.plus(dirs).plus(
                    List(maxHierarchy - dirs.size) {
                        ""
                    }
                )

            else -> rowWithoutDirs.plus(dirs.subList(0, maxHierarchy))
        }
    }

    override fun getDialog(): AnalyserDialogInterface = Dialog

    override fun isApplicable(resourceToBeParsed: String): Boolean {
        return false
    }
}

private fun Node.toAttributeList(attributeNames: List<String>): List<String> {
    return attributeNames.map {
        this.attributes[it]?.toString() ?: ""
    }
}

private val Path.toPath: String
    get() {
        return this.edgesList.joinToString("/")
    }
