package de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode

/**
 * Extracts binding identifiers from for-in statements and catch clauses.
 */
internal fun extractFirstBindingIdentifiers(node: SyntaxNode): List<String> {
    for (child in node.children()) {
        when (child.type) {
            IDENTIFIER -> {
                return listOf(child.text)
            }
            OBJECT_PATTERN,
            ARRAY_PATTERN -> {
                return extractIdentifiersFromPattern(child)
            }
        }
    }
    return emptyList()
}
