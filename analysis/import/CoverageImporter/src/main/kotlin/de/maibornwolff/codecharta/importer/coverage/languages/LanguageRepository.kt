package de.maibornwolff.codecharta.importer.coverage.languages

import de.maibornwolff.codecharta.importer.coverage.JavaStrategy
import de.maibornwolff.codecharta.serialization.FileExtension
import de.maibornwolff.codecharta.util.ResourceSearchHelper.Companion.isFileWithOneOrMoreOfEndingsPresent

internal enum class Language(
    val languageName: String,
    val strategy: ImporterStrategy,
    val fileExtensions: List<FileExtension>,
    val defaultReportFileName: String
) {
    JAVASCRIPT("javascript", JavaScriptStrategy(), listOf(FileExtension.INFO), "lcov.info"),
    JAVA("java", JavaStrategy(), listOf(FileExtension.XML), "jacoco.xml")
}

private val languageChoicesToLanguage = mapOf(
    "javascript/typescript" to Language.JAVASCRIPT,
    "java" to Language.JAVA
)

private val languageInputToLanguage = mapOf(
    "javascript" to Language.JAVASCRIPT,
    "typescript" to Language.JAVASCRIPT,
    "js" to Language.JAVASCRIPT,
    "ts" to Language.JAVASCRIPT,
    "java" to Language.JAVA
)

internal fun getLanguageChoices(): List<String> {
    return languageChoicesToLanguage.keys.toList()
}

internal fun getLanguageForLanguageChoice(languageChoice: String): Language {
    return languageChoicesToLanguage[languageChoice] ?: throw IllegalArgumentException("Unsupported language choice: $languageChoice")
}

internal fun getLanguageForLanguageInput(languageInput: String): Language {
    return languageInputToLanguage[languageInput] ?: throw IllegalArgumentException("Unsupported language: $languageInput")
}

internal fun isLanguageSupported(language: String): Boolean {
    return languageInputToLanguage.containsKey(language)
}

internal fun isAnyStrategyApplicable(resourceToBeParsed: String): Boolean {
    return Language.entries.any {
        isFileWithOneOrMoreOfEndingsPresent(resourceToBeParsed, it.fileExtensions.map { it.extension })
    } // TODO: change
}
