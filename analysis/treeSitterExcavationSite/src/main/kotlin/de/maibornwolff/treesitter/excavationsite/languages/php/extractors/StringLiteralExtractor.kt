package de.maibornwolff.treesitter.excavationsite.languages.php.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.StringParser
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import org.treesitter.TSNode

private const val INCLUDE_EXPRESSION = "include_expression"
private const val REQUIRE_EXPRESSION = "require_expression"
private const val INCLUDE_ONCE_EXPRESSION = "include_once_expression"
private const val REQUIRE_ONCE_EXPRESSION = "require_once_expression"

/**
 * Extracts non-include/require string literals from PHP code.
 *
 * Returns null for strings inside include/require expressions,
 * allowing them to be skipped during extraction.
 */
internal fun extractNonImportString(node: TSNode, sourceCode: String): String? {
    if (isIncludeString(node)) return null
    val text = TreeTraversal.getNodeText(node, sourceCode)
    return StringParser.stripAnyQuotes(text)
}

/**
 * Extracts non-include/require encapsed string literals from PHP code.
 *
 * Returns null for strings inside include/require expressions.
 */
internal fun extractNonImportEncapsedString(node: TSNode, sourceCode: String): String? {
    if (isIncludeString(node)) return null
    val text = TreeTraversal.getNodeText(node, sourceCode)
    return text.removeSurrounding("\"")
}

private fun isIncludeString(node: TSNode): Boolean = TreeTraversal.hasAncestorOfTypes(
    node,
    INCLUDE_EXPRESSION,
    REQUIRE_EXPRESSION,
    INCLUDE_ONCE_EXPRESSION,
    REQUIRE_ONCE_EXPRESSION
)
