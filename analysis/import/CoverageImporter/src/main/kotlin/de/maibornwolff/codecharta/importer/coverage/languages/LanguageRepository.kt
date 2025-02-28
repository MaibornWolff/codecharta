package de.maibornwolff.codecharta.importer.coverage.languages

import de.maibornwolff.codecharta.importer.tokeiimporter.strategy.ImporterStrategy
import de.maibornwolff.codecharta.importer.tokeiimporter.strategy.JavaScriptTypeScriptStrategy
import de.maibornwolff.codecharta.serialization.FileExtension

val languageChoices = listOf("javascript/typescript")

val languageToStrategyMap = mapOf(
    "javascript/typescript" to JavaScriptTypeScriptStrategy(),
    "javascript" to JavaScriptTypeScriptStrategy(),
    "typescript" to JavaScriptTypeScriptStrategy(),
    "js" to JavaScriptTypeScriptStrategy(),
    "ts" to JavaScriptTypeScriptStrategy()
)

fun getStrategyForLanguage(language: String): ImporterStrategy {
    return languageToStrategyMap[language] ?: throw IllegalArgumentException("Unsupported language: $language")
}

fun getFileExtensionsForLanguage(language: String): List<FileExtension> {
    return getStrategyForLanguage(language).fileExtensions
}

fun isLanguageSupported(language: String): Boolean {
    return languageToStrategyMap.containsKey(language)
}
