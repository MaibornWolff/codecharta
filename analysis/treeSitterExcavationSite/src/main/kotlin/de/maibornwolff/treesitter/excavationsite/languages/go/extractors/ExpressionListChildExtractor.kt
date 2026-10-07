package de.maibornwolff.treesitter.excavationsite.languages.go.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children

private const val IDENTIFIER = "identifier"
private const val EXPRESSION_LIST = "expression_list"

/**
 * Extracts identifiers from range clause or type switch statement.
 * These use expression_list child for loop/switch variables.
 */
internal fun extractIdentifiersFromExpressionListChild(node: SyntaxNode): List<String> = node
    .children()
    .firstOrNull { it.type == EXPRESSION_LIST }
    ?.let { TreeTraversal.findAllChildrenTextByType(it, IDENTIFIER) }
    ?: emptyList()
