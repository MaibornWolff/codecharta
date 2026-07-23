package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.pipeline

data class ExtractedText(val text: String, val context: ExtractionContext)

enum class ExtractionContext {
    IDENTIFIER,
    COMMENT,
    STRING
}
