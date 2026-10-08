package de.maibornwolff.treesitter.excavationsite.languages.go.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TreeTraversal

private const val IDENTIFIER = "identifier"
private const val EXPRESSION_LIST = "expression_list"

/**
 * Extracts all identifiers from short variable declaration or receive statement.
 * Both use expression_list for multiple variables.
 */
internal fun extractAllFromExpressionList(node: SyntaxNode): List<String> {
    val exprList = node.children().firstOrNull { it.type == EXPRESSION_LIST }
    if (exprList != null) {
        return TreeTraversal.findAllChildrenTextByType(exprList, IDENTIFIER)
    }
    return TreeTraversal.findAllChildrenTextByType(node, IDENTIFIER)
}
