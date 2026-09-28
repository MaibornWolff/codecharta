package de.maibornwolff.treesitter.excavationsite.shared.domain

/**
 * The context from which text was extracted.
 */
enum class ExtractionContext {
    /** Identifier names (class, function, variable, parameter, etc.) */
    IDENTIFIER,

    /** Comment text (single-line or multi-line) */
    COMMENT,

    /** String literal content */
    STRING
}
