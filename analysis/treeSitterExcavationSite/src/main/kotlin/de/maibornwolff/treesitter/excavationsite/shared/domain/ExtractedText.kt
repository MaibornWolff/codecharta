package de.maibornwolff.treesitter.excavationsite.shared.domain

/**
 * Represents text extracted from source code with its extraction context.
 *
 * @property text The extracted text (identifier name, comment content, or string literal)
 * @property context The context from which the text was extracted
 */
data class ExtractedText(val text: String, val context: ExtractionContext)
