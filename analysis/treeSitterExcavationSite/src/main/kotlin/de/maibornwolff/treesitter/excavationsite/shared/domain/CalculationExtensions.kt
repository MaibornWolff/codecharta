package de.maibornwolff.treesitter.excavationsite.shared.domain

import org.treesitter.TSNode

/**
 * Language-specific calculation extensions for metrics collection.
 *
 * Used to customize metric calculation behavior for languages with special requirements,
 * such as Python's indentation-based functions or language-specific node filtering rules.
 */
data class CalculationExtensions(
    val hasFunctionBodyStartOrEndNode: Boolean = true,
    val ignoreNodeForComplexity: (TSNode, String) -> Boolean = { _, _ -> false },
    val ignoreNodeForCommentLines: (TSNode, String) -> Boolean = { _, _ -> false },
    val ignoreNodeForNumberOfFunctions: (TSNode, String) -> Boolean = { _, _ -> false },
    val ignoreNodeForRealLinesOfCode: (TSNode, String) -> Boolean = { _, _ -> false },
    val ignoreNodeForParameterOfFunctions: (TSNode, String) -> Boolean = { _, _ -> false },
    val ignoreNodeForMessageChainCall: (TSNode, String) -> Boolean = { _, _ -> false },
    val countNodeAsLeafNode: (TSNode) -> Boolean = { false }
)
