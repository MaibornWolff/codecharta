package de.maibornwolff.codecharta.analysers.importers.codemaat

import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserDialogInterface
import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserInterface
import de.maibornwolff.codecharta.analysers.analyserinterface.util.CodeChartaConstants
import de.maibornwolff.codecharta.model.AttributeDescriptor
import de.maibornwolff.codecharta.model.AttributeGenerator
import de.maibornwolff.codecharta.model.AttributeType
import de.maibornwolff.codecharta.model.AttributeTypes
import de.maibornwolff.codecharta.serialization.ProjectSerializer
import de.maibornwolff.codecharta.translator.MetricNameTranslator
import de.maibornwolff.codecharta.util.InputHelper
import picocli.CommandLine
import java.io.File
import java.io.IOException
import java.io.InputStream
import java.io.PrintStream

@CommandLine.Command(
    name = CodeMaatImporter.NAME,
    description = [CodeMaatImporter.DESCRIPTION],
    footer = [CodeChartaConstants.GENERIC_FOOTER]
)
class CodeMaatImporter(
    private val output: PrintStream = System.out
) : AnalyserInterface, AttributeGenerator {
    @CommandLine.Option(names = ["-h", "--help"], usageHelp = true, description = ["displays this help and exits"])
    private var help = false

    @CommandLine.Option(names = ["-o", "--output-file"], description = ["output File"])
    private var outputFile:
        String? = null

    @CommandLine.Option(names = ["-nc", "--not-compressed"], description = ["save uncompressed output File"])
    private var compress =
        true

    @CommandLine.Parameters(arity = "1..*", paramLabel = "FILE", description = ["codemaat coupling csv files"])
    private var files:
        List<File> = mutableListOf()

    private val pathSeparator =
        '/'

    private val csvDelimiter =
        ','

    override val name =
        NAME
    override val description =
        DESCRIPTION

    companion object {
        const val NAME =
            "codemaatimport"
        const val DESCRIPTION =
            "generates cc.json from codemaat coupling csv"

        @JvmStatic
        fun main(args: Array<String>) {
            CommandLine(CodeMaatImporter()).execute(*args)
        }
    }

    @Throws(IOException::class)
    override fun call(): Unit? {
        if (!InputHelper.isInputValid(files.toTypedArray(), canInputContainFolders = false)) {
            throw IllegalArgumentException("Input invalid file for CodeMaatImporter, stopping execution...")
        }

        val csvProjectBuilder =
            CSVProjectBuilder(
                pathSeparator,
                csvDelimiter,
                codemaatReplacement,
                attributeTypes,
                getAttributeDescriptorMaps()
            )
        files.map {
            it.inputStream()
        }.forEach<InputStream> {
            csvProjectBuilder.parseCSVStream(it)
        }
        val project =
            csvProjectBuilder.build()

        ProjectSerializer.serializeToFileOrStream(project, outputFile, output, compress)

        return null
    }

    private val codemaatReplacement:
        MetricNameTranslator
        get() {
            val prefix =
                ""
            val replacementMap =
                mutableMapOf<String, String>()
            replacementMap["entity"] = "fromNodename"
            replacementMap["coupled"] = "toNodeName"
            replacementMap["degree"] = "pairingRate"
            replacementMap["average-revs"] = "avgCommits"

            return MetricNameTranslator(replacementMap.toMap(), prefix)
        }

    private val attributeTypes:
        AttributeTypes
        get() {
            val type =
                "edges"
            val attributeTypes =
                mutableMapOf<String, AttributeType>()
            attributeTypes["pairingRate"] = AttributeType.RELATIVE
            attributeTypes["avgCommits"] = AttributeType.ABSOLUTE

            return AttributeTypes(attributeTypes.toMutableMap(), type)
        }

    override fun getDialog(): AnalyserDialogInterface = Dialog

    override fun isApplicable(resourceToBeParsed: String): Boolean {
        return false
    }

    override fun getAttributeDescriptorMaps(): Map<String, AttributeDescriptor> {
        return getAttributeDescriptors()
    }
}
