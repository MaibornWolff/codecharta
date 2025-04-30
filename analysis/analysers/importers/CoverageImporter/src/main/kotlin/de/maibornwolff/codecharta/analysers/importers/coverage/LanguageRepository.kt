package de.maibornwolff.codecharta.analysers.importers.coverage

import de.maibornwolff.codecharta.analysers.importers.coverage.strategies.DotnetStrategy
import de.maibornwolff.codecharta.analysers.importers.coverage.strategies.ImporterStrategy
import de.maibornwolff.codecharta.analysers.importers.coverage.strategies.JavaScriptStrategy
import de.maibornwolff.codecharta.analysers.importers.coverage.strategies.JavaStrategy
import de.maibornwolff.codecharta.serialization.FileExtension
import de.maibornwolff.codecharta.util.ResourceSearchHelper.Companion.isFileWithOneOrMoreOfEndingsPresent

internal enum class Language(
    val languageName: String,
    val strategy: ImporterStrategy,
    val fileExtensions: List<FileExtension>,
    val defaultReportFileName: String,
    val coverageAttributes: List<CoverageAttributes>
) {
    JAVASCRIPT(
        "javascript",
        JavaScriptStrategy(),
        listOf(FileExtension.INFO),
        "lcov.info",
        listOf(
            CoverageAttributes.LINE_COVERAGE,
            CoverageAttributes.BRANCH_COVERAGE,
            CoverageAttributes.STATEMENT_COVERAGE
        )
    ),
    JAVA(
        "java",
        JavaStrategy(),
        listOf(FileExtension.XML),
        "jacoco.xml",
        listOf(
            CoverageAttributes.LINE_COVERAGE,
            CoverageAttributes.INSTRUCTION_COVERAGE,
            CoverageAttributes.COMPLEXITY_COVERAGE,
            CoverageAttributes.METHOD_COVERAGE,
            CoverageAttributes.CLASS_COVERAGE
        )
    ),
    CSHARP(
        "csharp",
        DotnetStrategy(),
        listOf(FileExtension.XML),
        "coverage.cobertura.xml",
        listOf(
            CoverageAttributes.LINE_COVERAGE,
            CoverageAttributes.BRANCH_COVERAGE
        )
    )
}

private val languageChoicesToLanguage = mapOf(
    "javascript/typescript" to Language.JAVASCRIPT,
    "java" to Language.JAVA,
    "csharp/dotnet" to Language.CSHARP
)

private val languageInputToLanguage = mapOf(
    "javascript" to Language.JAVASCRIPT,
    "typescript" to Language.JAVASCRIPT,
    "js" to Language.JAVASCRIPT,
    "ts" to Language.JAVASCRIPT,
    "java" to Language.JAVA,
    "csharp" to Language.CSHARP,
    "dotnet" to Language.CSHARP
)

internal fun getLanguageChoices(): List<String> {
    return languageChoicesToLanguage.keys.toList()
}

internal fun getLanguageForLanguageChoice(languageChoice: String): Language {
    return languageChoicesToLanguage[languageChoice]
        ?: throw IllegalArgumentException("Unsupported language choice: $languageChoice")
}

internal fun getLanguageForLanguageInput(languageInput: String): Language {
    return languageInputToLanguage[languageInput]
        ?: throw IllegalArgumentException("Unsupported language: $languageInput")
}

internal fun isLanguageForLanguageInputSupported(languageInput: String): Boolean {
    return languageInputToLanguage.containsKey(languageInput)
}

internal fun isAnyStrategyApplicable(resourceToBeParsed: String): Boolean {
    return Language.entries.any {
        isFileWithOneOrMoreOfEndingsPresent(resourceToBeParsed, it.fileExtensions)
    }
}
