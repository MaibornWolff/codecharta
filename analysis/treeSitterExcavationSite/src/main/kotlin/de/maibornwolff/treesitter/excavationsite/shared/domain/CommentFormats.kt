package de.maibornwolff.treesitter.excavationsite.shared.domain

/**
 * Represents different comment formats used across languages.
 */
sealed class CommentFormats {
    /** Line comment with a prefix (e.g., //, #). */
    data class Line(val prefix: String) : CommentFormats()

    /** Block comment with /* */ markers. */
    data object Block : CommentFormats()

    /** XML doc comment with /// prefix. */
    data object XmlDoc : CommentFormats()

    /** HTML comment with <!-- --> markers. */
    data object Html : CommentFormats()

    /** Ruby multiline comment with =begin/=end markers. */
    data object RubyMultiline : CommentFormats()

    /** Auto-detect format based on content (for languages with unified comment node type). */
    data object AutoDetect : CommentFormats()
}
