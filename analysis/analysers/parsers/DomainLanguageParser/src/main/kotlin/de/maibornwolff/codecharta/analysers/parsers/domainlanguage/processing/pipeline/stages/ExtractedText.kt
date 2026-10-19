package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.pipeline.stages

import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.keywords.Language

/** @property language the language of the embedded source the text comes from; null for the language of the file */
data class ExtractedText(
    val text: String,
    val context: ExtractionContext,
    val interpretsEscapes: Boolean = true,
    val language: Language? = null
)

enum class ExtractionContext {
    IDENTIFIER,
    COMMENT,
    STRING,
    TEXT
}
