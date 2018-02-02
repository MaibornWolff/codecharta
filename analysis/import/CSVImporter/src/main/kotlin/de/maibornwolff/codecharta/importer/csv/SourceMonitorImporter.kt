package de.maibornwolff.codecharta.importer.csv

import com.google.common.collect.ImmutableList
import com.google.common.collect.ImmutableMap
import de.maibornwolff.codecharta.serialization.ProjectSerializer
import de.maibornwolff.codecharta.translator.MetricNameTranslator
import picocli.CommandLine
import java.io.*
import java.util.*
import java.util.concurrent.Callable

@CommandLine.Command(name = "sourcemonitorimport", description = ["generates cc.json from sourcemonitor csv"], footer = ["Copyright(c) 2018, MaibornWolff GmbH"])
class SourceMonitorImporter : Callable<Void> {

    @CommandLine.Option(names = ["-h", "--help"], usageHelp = true, description = ["displays this help and exits"])
    private var help = false

    @CommandLine.Option(names = ["-p", "--projectName"], description = ["project name"])
    private var projectName = "testProject"

    @CommandLine.Parameters(arity = "1..*", paramLabel = "FILE", description = ["sourcemonitor csv files"])
    private var files = ArrayList<String>()

    private val pathSeparator = '\\'

    private val csvDelimiter = ','

    @Throws(IOException::class)
    override fun call(): Void? {
        val project = CSVProjectAdapter(projectName, pathSeparator, csvDelimiter)
        getInputStreamsFromArgs(files).forEach { `in` -> project.addProjectFromCsv(`in`, sourceMonitorReplacement) }
        ProjectSerializer.serializeProject(project, OutputStreamWriter(System.out))

        return null
    }


    private val sourceMonitorReplacement: MetricNameTranslator
        get() {
            val prefix = "sm_"
            val replacementMap = HashMap<String, String>()
            replacementMap["Project Name"] = ""
            replacementMap["Checkpoint Name"] = ""
            replacementMap["Created On"] = ""
            replacementMap["File Name"] = "path"
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
                replacementMap["Statements at block level " + i] = "statements_at_level_" + i
            }

            return MetricNameTranslator(ImmutableMap.copyOf(replacementMap), prefix)
        }

    private fun getInputStreamsFromArgs(files: List<String>): List<InputStream> {
        val fileList = files.map { createFileInputStream(it) }
        return if (fileList.isEmpty()) ImmutableList.of(System.`in`) else fileList
    }

    private fun createFileInputStream(path: String): FileInputStream {
        try {
            return FileInputStream(path)
        } catch (e: FileNotFoundException) {
            throw RuntimeException("File $path not found.")
        }

    }

    companion object {
        @JvmStatic
        fun main(args: Array<String>) {
            CommandLine.call(SourceMonitorImporter(), System.out, *args)
        }
    }
}

