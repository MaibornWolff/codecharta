package de.maibornwolff.codecharta.importer.codemaat

import de.maibornwolff.codecharta.serialization.ProjectSerializer
import de.maibornwolff.codecharta.translator.MetricNameTranslator
import picocli.CommandLine
import java.io.*
import java.util.concurrent.Callable

@CommandLine.Command(name = "codemaat-couplingimport", description = ["generates cc.json from codemaat coupling csv"], footer = ["Copyright(c) 2018, MaibornWolff GmbH"])
class CodeMaatCouplingImporter : Callable<Void> {

    @CommandLine.Option(names = ["-h", "--help"], usageHelp = true, description = ["displays this help and exits"])
    private var help = false

    @CommandLine.Option(names = ["-p", "--projectName"], description = ["project name"])
    private var projectName = "testProject"

    @CommandLine.Option(names = ["-o", "--outputFile"], description = ["output File (or empty for stdout)"])
    private var outputFile: File? = null

    @CommandLine.Parameters(arity = "1..*", paramLabel = "FILE", description = ["codemaat coupling csv files"])
    private var files: List<File> = mutableListOf()

    private val pathSeparator = '\\'

    private val csvDelimiter = ','

    @Throws(IOException::class)
    override fun call(): Void? {
        val csvProjectBuilder = CSVProjectBuilder(projectName, pathSeparator, csvDelimiter, sourceMonitorReplacement)
        files.map { it.inputStream() }.forEach<InputStream> { csvProjectBuilder.parseCSVStream(it) }
        val project = csvProjectBuilder.build()

        ProjectSerializer.serializeProject(project, writer())

        return null
    }


    private val sourceMonitorReplacement: MetricNameTranslator
        get() {
            val prefix = "sm_"
            val replacementMap = mutableMapOf<String, String>()
            replacementMap["entity"] = "node"
            replacementMap["coupled"] = "dependsOn"
            replacementMap["degree"] = "pairingRate"
            replacementMap["average-revs"] = "averageRevisions"

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
            CommandLine.call(CodeMaatCouplingImporter(), System.out, *args)
        }
    }
}

