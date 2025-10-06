package de.maibornwolff.codecharta.analysers.parsers.unified.metriccalculators

import org.treesitter.TSNode

data class CalculationExtensions(
    val hasFunctionBodyStartOrEndNode: Boolean = true,
    val ignoreNodeForComplexity: (TSNode, String) -> Boolean = { _: TSNode, _: String -> false },
    val ignoreNodeForCommentLines: (TSNode, String) -> Boolean = { _: TSNode, _: String -> false },
    val ignoreNodeForNumberOfFunctions: (TSNode, String) -> Boolean = { _: TSNode, _: String -> false },
    val ignoreNodeForRealLinesOfCode: (TSNode, String) -> Boolean = { _: TSNode, _: String -> false },
    val ignoreNodeForParameterOfFunctions: (TSNode, String) -> Boolean = { _: TSNode, _: String -> false },
    val countNodeAsLeafNode: (TSNode) -> Boolean = { false }
)
