package de.maibornwolff.codecharta.importer.coverage.languages

import de.maibornwolff.codecharta.serialization.FileExtension

val languageChoicesToLanguage = mapOf("javascript/typescript" to "javascript")

val languageToStrategyMap = mapOf(
    "javascript" to JavaScriptStrategy(),
    "typescript" to JavaScriptStrategy(),
    "js" to JavaScriptStrategy(),
    "ts" to JavaScriptStrategy()
)

fun getLanguageForLanguageChoice(languageChoice: String): String {
    return languageChoicesToLanguage[languageChoice] ?: throw IllegalArgumentException("Unsupported language choice: $languageChoice")
}

fun getStrategyForLanguage(language: String): ImporterStrategy {
    return languageToStrategyMap[language] ?: throw IllegalArgumentException("Unsupported language: $language")
}

fun getFileExtensionsForLanguage(language: String): List<FileExtension> {
    return getStrategyForLanguage(language).fileExtensions
}

fun getDefaultReportNameFileForLanguage(language: String): String {
    return getStrategyForLanguage(language).defaultReportFileName
}

fun isLanguageSupported(language: String): Boolean {
    return languageToStrategyMap.containsKey(language)
}
