package de.maibornwolff.treesitter.excavationsite.languages.rust.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.CommentParser
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import org.treesitter.TSNode

private const val LINE_INNER_DOC = "//!"
private const val BLOCK_INNER_DOC = "/*!"
private const val BLOCK_START = "/*"

/**
 * Extracts a Rust line comment, stripping the inner-doc marker `//!` (which the
 * shared [CommentParser] does not special-case) before delegating the remaining
 * `//` / `///` forms to the shared marker stripper.
 */
internal fun extractRustLineComment(node: TSNode, sourceCode: String): String {
    val text = TreeTraversal.getNodeText(node, sourceCode)
    return if (text.startsWith(LINE_INNER_DOC)) {
        text.removePrefix(LINE_INNER_DOC).trim()
    } else {
        CommentParser.stripCommentMarkers(text)
    }
}

/**
 * Extracts a Rust block comment, normalizing a leading inner-doc bang marker so the
 * shared block stripper removes it like any other block comment (and still strips
 * leading asterisks from doc blocks).
 */
internal fun extractRustBlockComment(node: TSNode, sourceCode: String): String {
    val text = TreeTraversal.getNodeText(node, sourceCode)
    val normalized = if (text.startsWith(BLOCK_INNER_DOC)) BLOCK_START + text.removePrefix(BLOCK_INNER_DOC) else text
    return CommentParser.stripBlockComment(normalized)
}
