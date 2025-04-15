package de.maibornwolff.codecharta.analysers.importers.sourcemonitor

import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserDialogInterface
import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserInterface
import de.maibornwolff.codecharta.analysers.analyserinterface.util.CodeChartaConstants
import de.maibornwolff.codecharta.analysers.importers.csv.CSVProjectBuilder
import de.maibornwolff.codecharta.model.AttributeDescriptor
import de.maibornwolff.codecharta.model.AttributeGenerator
import de.maibornwolff.codecharta.serialization.ProjectSerializer
import de.maibornwolff.codecharta.translator.MetricNameTranslator
import de.maibornwolff.codecharta.util.InputHelper
import picocli.CommandLine
import java.io.File
import java.io.IOException
import java.io.InputStream
import java.io.PrintStream

@CommandLine.Command(
    name = SourceMonitorImporter.NAME,
    description = [SourceMonitorImporter.DESCRIPTION],
    footer = [CodeChartaConstants.GENERIC_FOOTER]
)
class SourceMonitorImporter(
    private val output: PrintStream = System.out
) : AnalyserInterface, AttributeGenerator {
    @CommandLine.Option(names = ["-h", "--help"], usageHelp = true, description = ["displays this help and exits"])
    private var help = false

    @CommandLine.Option(names = ["-nc", "--not-compressed"], description = ["save uncompressed output File"])
    private var compress = true

    @CommandLine.Option(names = ["-o", "--output-file"], description = ["output File"])
    private var outputFile: String? = null

    @CommandLine.Parameters(arity = "1..*", paramLabel = "FILE", description = ["sourcemonitor csv files"])
    private var files: List<File> = mutableListOf()

    private val pathSeparator = '\\'

    private val csvDelimiter = ','

    override val name = NAME
    override val description = DESCRIPTION

    companion object {
        const val NAME = "sourcemonitorimport"
        const val DESCRIPTION = "generates cc.json from sourcemonitor csv"

        @JvmStatic
        fun main(args: Array<String>) {
            CommandLine(SourceMonitorImporter()).execute(*args)
        }
    }

    @Throws(IOException::class)
    override fun call(): Unit? {
        if (!InputHelper.isInputValid(files.toTypedArray(), canInputContainFolders = false)) {
            throw IllegalArgumentException("Input invalid file for SourceMonitorImporter, stopping execution...")
        }

        val csvProjectBuilder =
            CSVProjectBuilder(
                pathSeparator,
                csvDelimiter,
                "File Name",
                sourceMonitorReplacement,
                getAttributeDescriptors()
            )
        files.map { it.inputStream() }.forEach<InputStream> { csvProjectBuilder.parseCSVStream(it) }
        val project = csvProjectBuilder.build(cleanAttributeDescriptors = true)

        ProjectSerializer.serializeToFileOrStream(project, outputFile, output, compress)

        return null
    }

    private val sourceMonitorReplacement: MetricNameTranslator
        get() {
            val prefix = "sm_"
            val replacementMap = mutableMapOf<String, String>()
            replacementMap["Project Name"] = ""
            replacementMap["Checkpoint Name"] = ""
            replacementMap["Created On"] = ""
            replacementMap["Lines"] = "loc"
            replacementMap["Statements"] = "rloc"
            replacementMap["Classes and Interfaces"] = "classes"
            replacementMap["Methods per Class"] = "functions_per_class"
            replacementMap["Average Statements per Method"] = "average_statements_per_function"
            replacementMap["Line Number of Most Complex Method*"] = ""
            replacementMap["Name of Most Complex Method*"] = ""
            replacementMap["Maximum Complexity*"] = "max_function_complexity"
            replacementMap["Line Number of Deepest Block"] = ""
            replacementMap["Maximum Block Depth"] = "max_block_depth"
            replacementMap["Average Block Depth"] = "average_block_depth"
            replacementMap["Average Complexity*"] = "average_function_complexity"

            for (i in 0..9) {
                replacementMap["Statements at block level $i"] = "statements_at_level_$i"
            }

            return MetricNameTranslator(replacementMap.toMap(), prefix)
        }

    override fun getDialog(): AnalyserDialogInterface = Dialog

    override fun isApplicable(resourceToBeParsed: String): Boolean {
        return false
    }

    override fun getAttributeDescriptorMaps(): Map<String, AttributeDescriptor> {
        return getAttributeDescriptors()
    }
}
