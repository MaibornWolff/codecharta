package de.maibornwolff.codecharta.importer.tokeiimporter.strategy

import com.google.gson.JsonElement
import com.google.gson.JsonObject
import de.maibornwolff.codecharta.model.ProjectBuilder

interface ImporterStrategy {
    var rootName: String
    var pathSeparator: String

    fun getLanguageSummaries(root: JsonElement): JsonObject
    fun buildCCJson(languageSummaries: JsonObject, projectBuilder: ProjectBuilder)
}
