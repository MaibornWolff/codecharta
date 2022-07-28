package de.maibornwolff.codecharta.importer.sourcemonitor

import de.maibornwolff.codecharta.importer.csv.CSVProjectBuilder
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
    name = "sourcemonitorimport",
    description = ["generates cc.json from sourcemonitor csv"],
    footer = ["Copyright(c) 2020, MaibornWolff GmbH"]
)
class SourceMonitorImporter(
        private val output: PrintStream = System.out,
        private val test: Boolean = false) : Callable<Void>, InteractiveParser {

    @CommandLine.Option(names = ["-h", "--help"], usageHelp = true, description = ["displays this help and exits"])
    private var help = false

    @CommandLine.Option(names = ["-nc", "--not-compressed"], description = ["save uncompressed output File"])
    private var compress = true

    @CommandLine.Option(names = ["-o", "--output-file"], description = ["output File (or empty for stdout)"])
    private var outputFile: String? = null

    @CommandLine.Parameters(arity = "1..*", paramLabel = "FILE", description = ["sourcemonitor csv files"])
    private var files: List<File> = mutableListOf()

    private val pathSeparator = '\\'

    private val csvDelimiter = ','

    @Throws(IOException::class)
    override fun call(): Void? {
        val csvProjectBuilder =
            CSVProjectBuilder(pathSeparator, csvDelimiter, "File Name", sourceMonitorReplacement)
        files.map { it.inputStream() }.forEach<InputStream> { csvProjectBuilder.parseCSVStream(it) }
        val project = csvProjectBuilder.build()
        val filePath = outputFile ?: "notSpecified"

        if (compress && filePath != "notSpecified") ProjectSerializer.serializeAsCompressedFile(project,
                OutputFileHandler.checkAndFixFileExtension(filePath)) else ProjectSerializer.serializeProject(project, OutputFileHandler.writer(outputFile ?: "", test, output))

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
            replacementMap["Statements"] = "statements"
            replacementMap["Classes and Interfaces"] = "classes"
            replacementMap["Methods per Class"] = "functions_per_classs"
            replacementMap["Average Statements per Method"] = "average_statements_per_function"
            replacementMap["Line Number of Most Complex Method*"] = ""
            replacementMap["Name of Most Complex Method*"] = ""
            replacementMap["Maximum Complexity*"] = "max_function_mcc"
            replacementMap["Line Number of Deepest Block"] = ""
            replacementMap["Maximum Block Depth"] = "max_block_depth"
            replacementMap["Average Block Depth"] = "average_block_depth"
            replacementMap["Average Complexity*"] = "average_function_mcc"

            for (i in 0..9) {
                replacementMap["Statements at block level $i"] = "statements_at_level_$i"
            }

            return MetricNameTranslator(replacementMap.toMap(), prefix)
        }

    companion object {
        @JvmStatic
        fun main(args: Array<String>) {
            CommandLine.call(SourceMonitorImporter(), System.out, *args)
        }
    }

    override fun getDialog(): ParserDialogInterface = ParserDialog
}
