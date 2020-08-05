package de.maibornwolff.codecharta.importer.tokeiimporter.strategy

import com.google.gson.Gson
import com.google.gson.JsonElement
import com.google.gson.JsonObject
import de.maibornwolff.codecharta.importer.tokeiimporter.analysisObject.AnalysisObject
import de.maibornwolff.codecharta.importer.tokeiimporter.analysisObject.Stats
import de.maibornwolff.codecharta.model.MutableNode
import de.maibornwolff.codecharta.model.PathFactory
import de.maibornwolff.codecharta.model.ProjectBuilder

class TokeiInnerStrategy(rootName: String, pathSeparator: String) : ImporterStrategy {
    override var rootName = ""
    override var pathSeparator = ""
    private val TOP_LEVEL_OBJECT = "inner"

    init {
        this.rootName = rootName
        this.pathSeparator = pathSeparator
    }

    override fun buildCCJson(languageSummaries: JsonObject, projectBuilder: ProjectBuilder) {
        val gson = Gson()
        for (languageEntry in languageSummaries.entrySet()) {
            val languageAnalysisObject = gson.fromJson(languageEntry.value, AnalysisObject::class.java)
            if (languageAnalysisObject.hasChildren()) {
                for (stat in languageAnalysisObject.stats!!) {
                    addAsNode(stat, projectBuilder)
                }
            }
        }
    }

    override fun getLanguageSummaries(root: JsonElement): JsonObject {
        return root.asJsonObject.get(TOP_LEVEL_OBJECT).asJsonObject
    }

    private fun addAsNode(stat: Stats, projectBuilder: ProjectBuilder) {
        val sanitizedName = stat.name.removePrefix(rootName).replace(pathSeparator, "/")
        val directory = sanitizedName.substringBeforeLast("/")
        val fileName = sanitizedName.substringAfterLast("/")

        val node = MutableNode(
                fileName, attributes = mapOf(
                "empty_lines" to stat.blanks,
                "rloc" to stat.code,
                "comment_lines" to stat.comments,
                "loc" to stat.lines))
        val path = PathFactory.fromFileSystemPath(directory)
        projectBuilder.insertByPath(path, node)
    }
}
