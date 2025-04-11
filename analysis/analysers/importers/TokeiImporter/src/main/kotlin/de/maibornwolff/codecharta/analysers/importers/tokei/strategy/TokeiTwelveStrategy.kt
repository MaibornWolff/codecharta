package de.maibornwolff.codecharta.analysers.importers.tokei.strategy

import com.google.gson.Gson
import com.google.gson.JsonElement
import com.google.gson.JsonObject
import de.maibornwolff.codecharta.analysers.importers.tokei.analysisObject.AnalysisObjectTwelve
import de.maibornwolff.codecharta.analysers.importers.tokei.analysisObject.Report
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
        if (isPathSeparatorArgumentEmpty(pathSeparator)) determinePathSeparator(languageSummaries)
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

    override fun determinePathSeparator(languageSummaries: JsonObject) {
        val gson = Gson()
        for (languageEntry in languageSummaries.entrySet()) {
            val languageAnalysisObject = gson.fromJson(languageEntry.value, AnalysisObjectTwelve::class.java)
            if (languageAnalysisObject.hasChildren()) {
                for (report in languageAnalysisObject.reports) {
                    if (findPathSeparator(report.name)) return
                }
            }
        }
        this.pathSeparator = "/"
    }

    private fun addAsNode(report: Report, projectBuilder: ProjectBuilder) {
        val sanitizedName = report.name.removePrefix(rootName).replace(pathSeparator, "/")
        val directory = sanitizedName.substringBeforeLast("/")
        val fileName = sanitizedName.substringAfterLast("/")

        val node =
            MutableNode(
                fileName,
                attributes =
                    mapOf(
                        "empty_lines" to report.stats.blanks,
                        "rloc" to report.stats.code,
                        "comment_lines" to report.stats.comments,
                        "loc" to report.stats.blanks + report.stats.code + report.stats.comments
                    )
            )

        val path = PathFactory.fromFileSystemPath(directory)
        projectBuilder.insertByPath(path, node)
    }
}
