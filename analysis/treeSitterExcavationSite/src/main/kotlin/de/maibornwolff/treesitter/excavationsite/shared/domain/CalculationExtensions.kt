package de.maibornwolff.treesitter.excavationsite.shared.domain

/**
 * Language-specific calculation extensions for metrics collection.
 *
 * Used to customize metric calculation behavior for languages with special requirements,
 * such as Python's indentation-based functions or language-specific node filtering rules.
 */
data class CalculationExtensions(
    val hasFunctionBodyStartOrEndNode: Boolean = true,
    val ignoreNodeForComplexity: (SyntaxNode, String) -> Boolean = { _, _ -> false },
    val ignoreNodeForCommentLines: (SyntaxNode, String) -> Boolean = { _, _ -> false },
    val ignoreNodeForNumberOfFunctions: (SyntaxNode, String) -> Boolean = { _, _ -> false },
    val ignoreNodeForRealLinesOfCode: (SyntaxNode, String) -> Boolean = { _, _ -> false },
    val ignoreNodeForParameterOfFunctions: (SyntaxNode, String) -> Boolean = { _, _ -> false },
    val ignoreNodeForMessageChainCall: (SyntaxNode, String) -> Boolean = { _, _ -> false },
    val countNodeAsLeafNode: (SyntaxNode) -> Boolean = { false }
)
