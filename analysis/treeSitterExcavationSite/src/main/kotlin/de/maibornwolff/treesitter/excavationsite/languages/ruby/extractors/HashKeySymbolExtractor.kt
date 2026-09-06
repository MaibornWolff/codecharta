package de.maibornwolff.treesitter.excavationsite.languages.ruby.extractors

import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import org.treesitter.TSNode

private const val KEYWORD_PATTERN = "keyword_pattern"

/**
 * Extracts hash key symbol, skipping if in keyword pattern.
 */
internal fun extractFromHashKeySymbol(node: TSNode, sourceCode: String): String? = if (node.parent?.type == KEYWORD_PATTERN) {
    null
} else {
    TreeTraversal.getNodeText(node, sourceCode)
}
