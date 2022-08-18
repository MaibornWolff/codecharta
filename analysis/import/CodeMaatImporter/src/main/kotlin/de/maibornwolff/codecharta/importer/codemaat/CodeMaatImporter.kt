package de.maibornwolff.codecharta.importer.codemaat

import de.maibornwolff.codecharta.model.AttributeType
import de.maibornwolff.codecharta.model.AttributeTypes
import de.maibornwolff.codecharta.serialization.OutputFileHandler
import de.maibornwolff.codecharta.serialization.ProjectSerializer
import de.maibornwolff.codecharta.tools.interactiveparser.InteractiveParser
import de.maibornwolff.codecharta.tools.interactiveparser.ParserDialogInterface
import de.maibornwolff.codecharta.translator.MetricNameTranslator
import picocli.CommandLine
import java.io.File
import java.io.IOException
import java.io.InputStream
import java.io.PrintStream
import java.util.concurrent.Callable

@CommandLine.Command(
        name = "codemaatimport",
        description = ["generates cc.json from codemaat coupling csv"],
        footer = ["Copyright(c) 2022, MaibornWolff GmbH"]
)
class CodeMaatImporter(
        private val output: PrintStream = System.out) : Callable<Void>, InteractiveParser {

    @CommandLine.Option(names = ["-h", "--help"], usageHelp = true, description = ["displays this help and exits"])
    private var help = false

    @CommandLine.Option(names = ["-o", "--output-file"], description = ["output File"])
    private var outputFile: String? = null

    @CommandLine.Option(names = ["-nc", "--not-compressed"], description = ["save uncompressed output File"])
    private var compress = true

    @CommandLine.Parameters(arity = "1..*", paramLabel = "FILE", description = ["codemaat coupling csv files"])
    private var files: List<File> = mutableListOf()

    private val pathSeparator = '/'

    private val csvDelimiter = ','

    @Throws(IOException::class)
    override fun call(): Void? {
        val csvProjectBuilder =
                CSVProjectBuilder(pathSeparator, csvDelimiter, codemaatReplacement, attributeTypes)
        files.map { it.inputStream() }.forEach<InputStream> { csvProjectBuilder.parseCSVStream(it) }
        val project = csvProjectBuilder.build()

        val filePath = outputFile ?: "notSpecified"

        if (compress && filePath != "notSpecified") {
            ProjectSerializer.serializeAsCompressedFile(project, filePath)
        } else {
            ProjectSerializer.serializeProject(project, OutputFileHandler.writer(outputFile ?: "", output))
        }

        return null
    }

    private val codemaatReplacement: MetricNameTranslator
        get() {
            val prefix = ""
            val replacementMap = mutableMapOf<String, String>()
            replacementMap["entity"] = "fromNodename"
            replacementMap["coupled"] = "toNodeName"
            replacementMap["degree"] = "pairingRate"
            replacementMap["average-revs"] = "avgCommits"

            return MetricNameTranslator(replacementMap.toMap(), prefix)
        }

    private val attributeTypes: AttributeTypes
        get() {
            val type = "edges"
            val attributeTypes = mutableMapOf<String, AttributeType>()
            attributeTypes["pairingRate"] = AttributeType.relative
            attributeTypes["avgCommits"] = AttributeType.absolute

            return AttributeTypes(attributeTypes.toMutableMap(), type)
        }

    companion object {
        @JvmStatic
        fun main(args: Array<String>) {
            CommandLine.call(CodeMaatImporter(), System.out, *args)
        }
    }

    override fun getDialog(): ParserDialogInterface = ParserDialog
}
