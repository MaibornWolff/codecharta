package de.maibornwolff.codecharta.importer.tokeiimporter.strategy

import com.google.gson.JsonElement
import com.google.gson.JsonObject
import de.maibornwolff.codecharta.model.ProjectBuilder
import mu.KLogger

interface ImporterStrategy {
    var rootName: String
    var pathSeparator: String
    var logger: KLogger

    fun getLanguageSummaries(root: JsonElement): JsonObject
    fun determinePathSeparator(languageSummaries: JsonObject)
    fun buildCCJson(languageSummaries: JsonObject, projectBuilder: ProjectBuilder)

    fun isPathSeparatorArgumentEmpty(pathSeparator: String): Boolean {
        return pathSeparator.isEmpty()
    }

    fun findPathSeparator(name: String): Boolean {
        val result = Regex("\\\\|/").find(name)
        if (result != null) {
            pathSeparator = result.value
            logger.info("Determined ${result.value} as path separator")
            return true
        }
        return false
    }
}
