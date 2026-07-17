package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.pipeline

/**
 * Represents text extracted from source code with its extraction context.
 *
 * @property text The extracted text (identifier, comment, or string literal)
 * @property context The extraction context (IDENTIFIER, COMMENT, or STRING)
 */
data class ExtractedText(val text: String, val context: ExtractionContext)

enum class ExtractionContext {
    IDENTIFIER,
    COMMENT,
    STRING
}
