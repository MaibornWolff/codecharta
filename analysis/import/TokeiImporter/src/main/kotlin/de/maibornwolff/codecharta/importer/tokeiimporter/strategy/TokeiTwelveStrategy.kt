package de.maibornwolff.codecharta.importer.tokeiimporter.strategy

import com.google.gson.Gson
import com.google.gson.JsonElement
import com.google.gson.JsonObject
import de.maibornwolff.codecharta.importer.tokeiimporter.AnalysisObject.AnalysisObjectTwelve
import de.maibornwolff.codecharta.importer.tokeiimporter.AnalysisObject.Report
import de.maibornwolff.codecharta.model.MutableNode
import de.maibornwolff.codecharta.model.PathFactory
import de.maibornwolff.codecharta.model.ProjectBuilder

class TokeiTwelveStrategy(rootName: String, pathSeparator: String) : ImporterStrategy {
    override var rootName = ""
    override var pathSeparator = ""

    init {
        this.rootName = rootName
        this.pathSeparator = pathSeparator
    }

    override fun buildCCJson(languageSummaries: JsonObject, projectBuilder: ProjectBuilder) {
        val gson = Gson()
        for (languageEntry in languageSummaries.entrySet()) {
            val languageAnalysisObject = gson.fromJson(languageEntry.value, AnalysisObjectTwelve::class.java)
            if (languageAnalysisObject.hasChildren()) {
                for (report in languageAnalysisObject.reports) {
                    addAsNode(report, projectBuilder)
                }
            }
        }
    }

    override fun getLanguageSummaries(root: JsonElement): JsonObject {
        return root.asJsonObject
    }

    private fun addAsNode(report: Report, projectBuilder: ProjectBuilder) {
        val sanitizedName = report.name.removePrefix(rootName).replace(pathSeparator, "/")
        val directory = sanitizedName.substringBeforeLast("/")
        val fileName = sanitizedName.substringAfterLast("/")

        val node = MutableNode(
                fileName, attributes = mapOf(
                "empty_lines" to report.stats.blanks,
                "rloc" to report.stats.code,
                "comment_lines" to report.stats.comments))

        val path = PathFactory.fromFileSystemPath(directory)
        projectBuilder.insertByPath(path, node)
    }
}
