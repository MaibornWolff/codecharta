package de.maibornwolff.treesitter.excavationsite.shared.domain

import org.treesitter.TSNode

data class CalculationContext(
    val node: TSNode,
    val nodeType: String,
    val startRow: Int = -1,
    val endRow: Int = -1,
    val shouldIgnoreNode: (TSNode, String) -> Boolean,
    val countNodeAsLeafNode: (TSNode) -> Boolean = { false },
    val functionBodyUsesBrackets: Boolean = true
)
