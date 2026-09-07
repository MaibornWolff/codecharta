package de.maibornwolff.treesitter.excavationsite.languages.go.extractors

import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children
import org.treesitter.TSNode

private const val IDENTIFIER = "identifier"
private const val EXPRESSION_LIST = "expression_list"

/**
 * Extracts first identifier from short variable declaration.
 * Short var declarations use expression_list for multiple variables.
 */
internal fun extractFromExpressionList(node: TSNode, sourceCode: String): String? {
    val exprList = node.children().firstOrNull { it.type == EXPRESSION_LIST }
    if (exprList != null) {
        return TreeTraversal.findFirstChildTextByType(exprList, sourceCode, IDENTIFIER)
    }
    return TreeTraversal.findFirstChildTextByType(node, sourceCode, IDENTIFIER)
}
