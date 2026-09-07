package de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors

import de.maibornwolff.treesitter.excavationsite.languages.javascript.IDENTIFIER
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children
import org.treesitter.TSNode

/**
 * Extracts identifier from arrow function without parentheses: `c => c !== " "`
 *
 * Returns the identifier only if the first child is a bare identifier
 * (not wrapped in parentheses or formal parameters).
 * This avoids extracting identifiers from the expression body.
 */
internal fun extractArrowFunctionSingleParameter(node: TSNode, sourceCode: String): String? {
    val firstChild = node.children().firstOrNull() ?: return null
    return if (firstChild.type == IDENTIFIER) {
        TreeTraversal.getNodeText(firstChild, sourceCode)
    } else {
        null
    }
}
