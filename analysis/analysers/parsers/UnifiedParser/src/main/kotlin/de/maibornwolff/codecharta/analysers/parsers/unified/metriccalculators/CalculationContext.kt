package de.maibornwolff.codecharta.analysers.parsers.unified.metriccalculators

import org.treesitter.TSNode

data class CalculationContext(
    val node: TSNode,
    val nodeType: String,
    val startRow: Int = -1,
    val endRow: Int = -1,
    val shouldIgnoreNode: (TSNode, String) -> Boolean,
    val countNodeAsLeafNode: (TSNode) -> Boolean = { false },
    val hasFunctionBodyStartOrEndNode: Pair<Boolean, Boolean> = Pair(true, true)
)
