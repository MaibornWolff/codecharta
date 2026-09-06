package de.maibornwolff.treesitter.excavationsite.languages.go.extractors

import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children
import org.treesitter.TSNode

private const val IDENTIFIER = "identifier"
private const val EXPRESSION_LIST = "expression_list"

/**
 * Extracts all identifiers from short variable declaration or receive statement.
 * Both use expression_list for multiple variables.
 */
internal fun extractAllFromExpressionList(node: TSNode, sourceCode: String): List<String> {
    val exprList = node.children().firstOrNull { it.type == EXPRESSION_LIST }
    if (exprList != null) {
        return TreeTraversal.findAllChildrenTextByType(exprList, sourceCode, IDENTIFIER)
    }
    return TreeTraversal.findAllChildrenTextByType(node, sourceCode, IDENTIFIER)
}
