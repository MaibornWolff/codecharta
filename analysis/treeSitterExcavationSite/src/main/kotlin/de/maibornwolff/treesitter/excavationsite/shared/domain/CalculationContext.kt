package de.maibornwolff.treesitter.excavationsite.shared.domain

data class CalculationContext(
    val node: SyntaxNode,
    val nodeType: String,
    val startRow: Int = -1,
    val endRow: Int = -1,
    val shouldIgnoreNode: (SyntaxNode, String) -> Boolean,
    val countNodeAsLeafNode: (SyntaxNode) -> Boolean = { false },
    val functionBodyUsesBrackets: Boolean = true
)
