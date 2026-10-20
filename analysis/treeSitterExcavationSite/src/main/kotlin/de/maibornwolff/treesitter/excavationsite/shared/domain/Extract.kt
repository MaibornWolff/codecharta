package de.maibornwolff.treesitter.excavationsite.shared.domain

sealed class Extract {
    data class Identifier(
        val single: ExtractionStrategy? = null,
        val multi: ExtractionStrategy? = null,
        val customSingle: ((SyntaxNode) -> String?)? = null,
        val customMulti: ((SyntaxNode) -> List<String>)? = null
    ) : Extract()

    data class Comment(val format: CommentFormats? = null, val custom: ((SyntaxNode) -> String?)? = null) : Extract() {
        init {
            require(format != null || custom != null) {
                "Either format or custom must be provided for Comment extraction"
            }
        }
    }

    /** The text a user reads, such as a template's text content; [custom] returns null to skip the node. */
    data class Text(val custom: (SyntaxNode) -> String?) : Extract()

    /** [isRaw] tells whether a string node is raw, so its backslashes are text. */
    data class StringLiteral(
        val format: StringFormats? = null,
        val custom: ((SyntaxNode) -> String?)? = null,
        val isRaw: (SyntaxNode) -> Boolean = { false }
    ) : Extract() {
        init {
            require(format != null || custom != null) {
                "Either format or custom must be provided for StringLiteral extraction"
            }
        }
    }
}
