package de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors

import de.maibornwolff.treesitter.excavationsite.languages.javascript.ARRAY_PATTERN
import de.maibornwolff.treesitter.excavationsite.languages.javascript.IDENTIFIER
import de.maibornwolff.treesitter.excavationsite.languages.javascript.OBJECT_PATTERN
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children
import org.treesitter.TSNode

/**
 * Extracts identifiers from variable declarator, handling destructuring patterns.
 */
internal fun extractIdentifiersFromVariableDeclarator(node: TSNode, sourceCode: String): List<String> {
    val firstChild = node.children().firstOrNull() ?: return emptyList()
    return when (firstChild.type) {
        OBJECT_PATTERN,
        ARRAY_PATTERN -> extractIdentifiersFromPattern(firstChild, sourceCode)
        IDENTIFIER -> {
            listOf(TreeTraversal.getNodeText(firstChild, sourceCode))
        }
        else -> emptyList()
    }
}
