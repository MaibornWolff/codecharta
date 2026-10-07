package de.maibornwolff.treesitter.excavationsite.languages.swift.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.domain.children

private const val SIMPLE_IDENTIFIER = "simple_identifier"
private const val PATTERN = "pattern"

/**
 * Extracts identifier from property declaration via its pattern child.
 *
 * Swift properties have structure: `let/var pattern: Type = value`
 * where pattern contains the simple_identifier.
 */
internal fun extractFromPattern(node: SyntaxNode): String? {
    val patternChild = node.children().firstOrNull {
        it.type == PATTERN
    } ?: return null
    return TreeTraversal.findFirstChildTextByType(patternChild, SIMPLE_IDENTIFIER)
}
