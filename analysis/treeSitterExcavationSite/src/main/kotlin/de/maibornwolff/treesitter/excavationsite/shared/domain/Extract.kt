package de.maibornwolff.treesitter.excavationsite.shared.domain
import org.treesitter.TSNode

/**
 * Represents how to extract text from an AST node.
 *
 * Each extraction type defines a specific extraction behavior
 * when encountering a node during AST traversal.
 */
sealed class Extract {
    /**
     * Extract identifier(s) using a pattern.
     *
     * @param single Strategy for extracting a single identifier
     * @param multi Strategy for extracting multiple identifiers (optional)
     * @param customSingle Custom function for single identifier extraction (optional)
     * @param customMulti Custom function for multiple identifier extraction (optional)
     */
    data class Identifier(
        val single: ExtractionStrategy? = null,
        val multi: ExtractionStrategy? = null,
        val customSingle: ((TSNode, String) -> String?)? = null,
        val customMulti: ((TSNode, String) -> List<String>)? = null
    ) : Extract()

    /**
     * Extract comment text using a format or custom function.
     *
     * @param format The comment format to use for parsing (optional)
     * @param custom Custom function for comment extraction (optional)
     */
    data class Comment(val format: CommentFormats? = null, val custom: ((TSNode, String) -> String?)? = null) : Extract() {
        init {
            require(format != null || custom != null) {
                "Either format or custom must be provided for Comment extraction"
            }
        }
    }

    /**
     * Extract string literal content using a format or custom function.
     *
     * @param format The string format to use for parsing (optional)
     * @param custom Custom function for string extraction (optional)
     */
    data class StringLiteral(val format: StringFormats? = null, val custom: ((TSNode, String) -> String?)? = null) : Extract() {
        init {
            require(format != null || custom != null) {
                "Either format or custom must be provided for StringLiteral extraction"
            }
        }
    }
}
