package de.maibornwolff.treesitter.excavationsite.languages.python.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal

/**
 * Extracts exception variable from except clause: `except ValueError as e`.
 */
internal fun extractFromExceptClause(node: SyntaxNode, sourceCode: String): String? {
    val nameNode = node.getChildByFieldName("name")
    if (nameNode.isNull) return null
    return TreeTraversal.getNodeText(nameNode, sourceCode)
}
