package de.maibornwolff.treesitter.excavationsite.languages.python.extractors

import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children
import org.treesitter.TSNode

/**
 * Extracts loop variables from for statement or for_in_clause.
 * Handles single variables and tuple unpacking: `for x, y in pairs`.
 */
internal fun extractLoopVariables(node: TSNode, sourceCode: String): List<String> {
    for (child in node.children()) {
        when (child.type) {
            "identifier" -> {
                return listOf(TreeTraversal.getNodeText(child, sourceCode))
            }
            "pattern_list",
            "tuple_pattern" -> {
                return extractAllIdentifiers(child, sourceCode)
            }
        }
    }
    return emptyList()
}
