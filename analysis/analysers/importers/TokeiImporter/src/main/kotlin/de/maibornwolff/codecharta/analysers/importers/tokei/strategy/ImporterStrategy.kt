package de.maibornwolff.codecharta.analysers.importers.tokei.strategy

import com.google.gson.JsonElement
import com.google.gson.JsonObject
import de.maibornwolff.codecharta.model.ProjectBuilder
import de.maibornwolff.codecharta.util.Logger

interface ImporterStrategy {
    var rootName: String
    var pathSeparator: String

    fun getLanguageSummaries(root: JsonElement): JsonObject

    fun determinePathSeparator(languageSummaries: JsonObject)

    fun buildCCJson(languageSummaries: JsonObject, projectBuilder: ProjectBuilder)

    fun isPathSeparatorArgumentEmpty(pathSeparator: String): Boolean {
        return pathSeparator.isEmpty()
    }

    fun findPathSeparator(name: String): Boolean {
        val result = Regex("[\\\\|/]").find(name)
        if (result != null) {
            pathSeparator = result.value
            Logger.info { "Determined ${result.value} as path separator" }
            return true
        }
        return false
    }
}
