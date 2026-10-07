package de.maibornwolff.treesitter.excavationsite.languages.abl.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.children

/**
 * Extracts the method name from an ABL method_definition node.
 *
 * ABL method structure: METHOD [access] [return_type] [method_name](params)
 * The method name is the second identifier child (first is return type).
 */
fun extractAblMethodName(node: SyntaxNode): String? {
    val identifiers = node
        .children()
        .filter { it.type == "identifier" }
        .toList()

    // Method name is the second identifier (after return type)
    // For VOID methods, there's only one identifier (the method name)
    return when {
        identifiers.size >= 2 -> identifiers[1].text.trim()
        identifiers.size == 1 -> identifiers[0].text.trim()
        else -> null
    }
}
