package de.maibornwolff.codecharta.importer.codemaat

import de.maibornwolff.codecharta.attributeTypes.AttributeTypes
import de.maibornwolff.codecharta.model.AttributeType
import de.maibornwolff.codecharta.serialization.ProjectSerializer
import de.maibornwolff.codecharta.translator.MetricNameTranslator
import picocli.CommandLine
import java.io.*
import java.util.concurrent.Callable

@CommandLine.Command(name = "codemaatimport", description = ["generates cc.json from codemaat coupling csv"],
        footer = ["Copyright(c) 2020, MaibornWolff GmbH"])
class CodeMaatImporter: Callable<Void> {

    @CommandLine.Option(names = ["-h", "--help"], usageHelp = true, description = ["displays this help and exits"])
    private var help = false

    @CommandLine.Option(names = ["-o", "--outputFile"], description = ["output File (or empty for stdout)"])
    private var outputFile: File? = null

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

        ProjectSerializer.serializeProject(project, writer())

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

            return AttributeTypes(attributeTypes.toMap(), type)
        }

    private fun writer(): Writer {
        return if (outputFile == null) {
            OutputStreamWriter(System.out)
        } else {
            BufferedWriter(FileWriter(outputFile))
        }
    }

    companion object {
        @JvmStatic
        fun main(args: Array<String>) {
            CommandLine.call(CodeMaatImporter(), System.out, *args)
        }
    }
}

