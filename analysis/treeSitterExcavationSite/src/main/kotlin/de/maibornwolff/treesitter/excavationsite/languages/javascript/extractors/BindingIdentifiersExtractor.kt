package de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors

import de.maibornwolff.treesitter.excavationsite.languages.javascript.ARRAY_PATTERN
import de.maibornwolff.treesitter.excavationsite.languages.javascript.IDENTIFIER
import de.maibornwolff.treesitter.excavationsite.languages.javascript.OBJECT_PATTERN
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children
import org.treesitter.TSNode

/**
 * Extracts binding identifiers from for-in statements and catch clauses.
 */
internal fun extractFirstBindingIdentifiers(node: TSNode, sourceCode: String): List<String> {
    for (child in node.children()) {
        when (child.type) {
            IDENTIFIER -> {
                return listOf(TreeTraversal.getNodeText(child, sourceCode))
            }
            OBJECT_PATTERN,
            ARRAY_PATTERN -> {
                return extractIdentifiersFromPattern(child, sourceCode)
            }
        }
    }
    return emptyList()
}
