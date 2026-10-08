package de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors

import de.maibornwolff.treesitter.excavationsite.languages.javascript.ARRAY_PATTERN
import de.maibornwolff.treesitter.excavationsite.languages.javascript.IDENTIFIER
import de.maibornwolff.treesitter.excavationsite.languages.javascript.OBJECT_PATTERN
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode

/**
 * Extracts identifiers from variable declarator, handling destructuring patterns.
 */
internal fun extractIdentifiersFromVariableDeclarator(node: SyntaxNode): List<String> {
    val firstChild = node.children().firstOrNull() ?: return emptyList()
    return when (firstChild.type) {
        OBJECT_PATTERN,
        ARRAY_PATTERN -> extractIdentifiersFromPattern(firstChild)
        IDENTIFIER -> {
            listOf(firstChild.text)
        }
        else -> emptyList()
    }
}
