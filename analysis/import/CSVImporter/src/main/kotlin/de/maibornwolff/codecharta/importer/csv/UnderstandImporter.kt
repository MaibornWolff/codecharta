package de.maibornwolff.codecharta.importer.csv

import de.maibornwolff.codecharta.serialization.ProjectSerializer
import de.maibornwolff.codecharta.translator.MetricNameTranslator
import picocli.CommandLine
import java.io.*
import java.util.concurrent.Callable

@CommandLine.Command(name = "understandimport", description = ["generates cc.json from SciTools (TM) Understand csv"], footer = ["Copyright(c) 2018, MaibornWolff GmbH"])
class UnderstandImporter : Callable<Void> {

    @CommandLine.Option(names = ["-h", "--help"], usageHelp = true, description = ["displays this help and exits"])
    private var help = false

    @CommandLine.Option(names = ["-p", "--projectName"], description = ["project name"])
    private var projectName = "testProject"

    @CommandLine.Option(names = ["-o", "--outputFile"], description = ["output File (or empty for stdout)"])
    private var outputFile: File? = null

    @CommandLine.Parameters(arity = "1..*", paramLabel = "FILE", description = ["Understand csv files"])
    private var files: List<File> = mutableListOf()

    @CommandLine.Option(names = ["--pathSeparator"], description = ["path separator (default = '/')"])
    private var pathSeparator = '/'

    private val csvDelimiter = ','

    @Throws(IOException::class)
    override fun call(): Void? {
        val includeRows = { row: Array<String> -> row[0] == "File" }
        val project = CSVProjectAdapter(projectName, pathSeparator, csvDelimiter, understandReplacement, includeRows)
        files.map { it.inputStream() }.forEach { project.addProjectFromCsv(it) }
        ProjectSerializer.serializeProject(project, writer())

        return null
    }


    private val understandReplacement: MetricNameTranslator
        get() {
            val prefix = "understand_"
            val replacementMap = mutableMapOf<String, String>()
            replacementMap["Kind"] = ""
            replacementMap["Name"] = ""
            replacementMap["File"] = "path"
            replacementMap["AvgCyclomatic"] = "average_function_mcc"
            replacementMap["CountDeclClass"] = "classes"
            replacementMap["CountDeclMethod"] = "functions"
            replacementMap["CountDeclMethodPublic"] = "public_api"
            replacementMap["CountLine"] = "loc"
            replacementMap["CountLineCode"] = "rloc"
            replacementMap["CountLineComment"] = "comment_lines"
            replacementMap["CountStmt"] = "statements"
            replacementMap["MaxCyclomatic"] = "max_function_mcc"
            replacementMap["MaxNesting"] = "max_block_depth"
            replacementMap["SumCyclomatic"] = "mcc"

            return MetricNameTranslator(replacementMap.toMap(), prefix)
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
            CommandLine.call(UnderstandImporter(), System.out, *args)
        }
    }
}

