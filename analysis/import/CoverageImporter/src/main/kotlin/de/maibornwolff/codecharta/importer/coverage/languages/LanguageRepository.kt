package de.maibornwolff.codecharta.importer.coverage.languages

import de.maibornwolff.codecharta.serialization.FileExtension

val allStrategies = listOf(
    JavaScriptStrategy()
)

private val languageChoicesToLanguage = mapOf("javascript/typescript" to "javascript")

private val languageToStrategyMap = mapOf(
    "javascript" to JavaScriptStrategy(),
    "typescript" to JavaScriptStrategy(),
    "js" to JavaScriptStrategy(),
    "ts" to JavaScriptStrategy()
)

fun getLanguageChoices(): List<String> {
    return languageChoicesToLanguage.keys.toList()
}

fun getLanguageForLanguageChoice(languageChoice: String): String {
    return languageChoicesToLanguage[languageChoice] ?: throw IllegalArgumentException("Unsupported language choice: $languageChoice")
}

fun getStrategyForLanguage(language: String): ImporterStrategy {
    return languageToStrategyMap[language] ?: throw IllegalArgumentException("Unsupported language: $language")
}

fun getFileExtensionsForLanguage(language: String): List<FileExtension> {
    return getStrategyForLanguage(language).fileExtensions
}

fun isLanguageSupported(language: String): Boolean {
    return languageToStrategyMap.containsKey(language)
}

fun isAnyStrategyApplicable(resourceToBeParsed: String): Boolean {
    return allStrategies.any { it.isApplicable(resourceToBeParsed) }
}
