package de.maibornwolff.codecharta.importer.tokeiimporter

import com.google.gson.Gson
import com.google.gson.JsonParser
import de.maibornwolff.codecharta.model.MutableNode
import de.maibornwolff.codecharta.model.PathFactory
import de.maibornwolff.codecharta.model.ProjectBuilder
import de.maibornwolff.codecharta.serialization.ProjectSerializer
import picocli.CommandLine
import java.io.*
import java.util.concurrent.Callable

@CommandLine.Command(
        name = "tokeiimporter",
        description = ["generates cc.json from tokei json"],
        footer = ["Copyright(c) 2019, MaibornWolff GmbH"]
)
class TokeiImporter : Callable<Void> {
    private var TOP_LEVEL_OBJECT: String = "inner"
    private lateinit var projectBuilder: ProjectBuilder

    @CommandLine.Option(names = ["-h", "--help"], usageHelp = true, description = ["displays this help and exits"])
    private var help = false

    @CommandLine.Option(names = ["-p", "--projectName"], description = ["project name"])
    private var projectName = "TokeiImporter"

    @CommandLine.Option(names = ["-r", "--rootName"], description = ["root folder as specified when executing tokei"])
    private var rootName = "."

    @CommandLine.Option(names = ["--pathSeparator"], description = ["path separator (default = '/')"])
    private var pathSeparator = "/"

    @CommandLine.Option(names = ["-o", "--outputFile"], description = ["output File (or empty for stdout)"])
    private var outputFile: File? = null

    @CommandLine.Parameters(paramLabel = "FILE", description = ["sourcemonitor csv file"])
    private var file: File? = null

    @Throws(IOException::class)
    override fun call(): Void? {
        projectBuilder = ProjectBuilder(projectName)
        val bufferedReader = file!!.bufferedReader()
        val root = JsonParser().parse(bufferedReader)
        val languageSummaries = root.asJsonObject.get(TOP_LEVEL_OBJECT).asJsonObject
        val gson = Gson()
        for (languageEntry in languageSummaries.entrySet()) {
            val languageAnalysisObject = gson.fromJson(languageEntry.value, AnalysisObject::class.java)
            if (languageAnalysisObject.hasChildren()) {
                for (analysisObject in languageAnalysisObject.stats!!) {
                    addAsNode(analysisObject)
                }
            }
        }
        ProjectSerializer.serializeProject(projectBuilder.build(), writer())
        return null
    }

    private fun addAsNode(analysisObject: AnalysisObject) {
        val sanitizedName = analysisObject.name!!.replaceFirst(rootName, "").replace(pathSeparator, "/")
        val directory = sanitizedName.substringBeforeLast("/")
        val fileName = sanitizedName.substringAfterLast("/")

        val node = MutableNode(
                fileName, attributes = mutableMapOf(
                "blanks" to analysisObject.blanks,
                "loc" to analysisObject.code,
                "comments" to analysisObject.comments,
                "lines" to analysisObject.lines
        )
        )
        val path = PathFactory.fromFileSystemPath(directory)
        projectBuilder.insertByPath(path, node)

    }

    private fun writer(): Writer {
        return if (outputFile == null) {
            OutputStreamWriter(System.out)
        } else {
            BufferedWriter(FileWriter(outputFile!!))
        }
    }

    companion object {
        @JvmStatic
        fun main(args: Array<String>) {
            CommandLine.call(TokeiImporter(), System.out, *args)
        }
    }
}

