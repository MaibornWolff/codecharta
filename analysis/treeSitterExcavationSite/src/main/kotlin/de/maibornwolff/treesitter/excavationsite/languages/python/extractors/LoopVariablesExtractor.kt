package de.maibornwolff.treesitter.excavationsite.languages.python.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode

/**
 * Extracts loop variables from for statement or for_in_clause.
 * Handles single variables and tuple unpacking: `for x, y in pairs`.
 */
internal fun extractLoopVariables(node: SyntaxNode): List<String> {
    for (child in node.children()) {
        when (child.type) {
            "identifier" -> {
                return listOf(child.text)
            }
            "pattern_list",
            "tuple_pattern" -> {
                return extractAllIdentifiers(child)
            }
        }
    }
    return emptyList()
}
