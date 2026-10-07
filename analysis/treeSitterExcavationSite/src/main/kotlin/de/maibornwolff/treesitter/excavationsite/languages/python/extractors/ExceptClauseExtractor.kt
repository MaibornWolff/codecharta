package de.maibornwolff.treesitter.excavationsite.languages.python.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode

/**
 * Extracts exception variable from except clause: `except ValueError as e`.
 */
internal fun extractFromExceptClause(node: SyntaxNode): String? {
    val nameNode = node.getChildByFieldName("name")
    if (nameNode.isNull) return null
    return nameNode.text
}
