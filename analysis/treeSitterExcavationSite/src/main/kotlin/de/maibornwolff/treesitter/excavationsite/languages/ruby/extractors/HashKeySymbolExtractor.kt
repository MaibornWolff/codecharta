package de.maibornwolff.treesitter.excavationsite.languages.ruby.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal

private const val KEYWORD_PATTERN = "keyword_pattern"

/**
 * Extracts hash key symbol, skipping if in keyword pattern.
 */
internal fun extractFromHashKeySymbol(node: SyntaxNode, sourceCode: String): String? = if (node.parent.type == KEYWORD_PATTERN) {
    null
} else {
    TreeTraversal.getNodeText(node, sourceCode)
}
