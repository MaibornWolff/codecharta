package de.maibornwolff.treesitter.excavationsite.shared.domain

/**
 * Represents text extracted from source code with its extraction context.
 *
 * @property text The extracted text (identifier name, comment content, or string literal)
 * @property context The context from which the text was extracted
 * @property interpretsEscapes False for a raw string, whose backslashes are text rather than escape sequences
 */
data class ExtractedText(val text: String, val context: ExtractionContext, val interpretsEscapes: Boolean = true)
