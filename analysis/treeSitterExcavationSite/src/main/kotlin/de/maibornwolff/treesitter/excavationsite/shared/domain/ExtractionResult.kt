package de.maibornwolff.treesitter.excavationsite.shared.domain

/**
 * Result of text extraction from source code.
 *
 * Contains all extracted text items with their context, plus convenience accessors
 * for filtering by context type.
 *
 * @property extractedTexts All extracted text items with their contexts
 */
data class ExtractionResult(val extractedTexts: List<ExtractedText>) {
    /** All extracted identifier names */
    val identifiers: List<String> by lazy {
        extractedTexts
            .filter { it.context == ExtractionContext.IDENTIFIER }
            .map { it.text }
    }

    /** All extracted comment contents */
    val comments: List<String> by lazy {
        extractedTexts
            .filter { it.context == ExtractionContext.COMMENT }
            .map { it.text }
    }

    /** All extracted string literal contents */
    val strings: List<String> by lazy {
        extractedTexts
            .filter { it.context == ExtractionContext.STRING }
            .map { it.text }
    }
}
