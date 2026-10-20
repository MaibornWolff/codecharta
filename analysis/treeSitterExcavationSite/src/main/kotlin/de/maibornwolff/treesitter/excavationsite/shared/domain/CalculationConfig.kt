package de.maibornwolff.treesitter.excavationsite.shared.domain

/** Declarative, so language definitions need not depend on the features layer that turns it into CalculationExtensions. */
data class CalculationConfig(
    /** False for languages whose function bodies are delimited by indentation, such as Python and Ruby. */
    val hasFunctionBodyStartOrEndNode: Boolean = true,
    val ignoreForComplexity: List<IgnoreRule> = emptyList(),
    val ignoreForCommentLines: List<IgnoreRule> = emptyList(),
    val ignoreForRloc: List<IgnoreRule> = emptyList(),
    val ignoreForParameters: List<IgnoreRule> = emptyList(),
    val ignoreForNumberOfFunctions: List<IgnoreRule> = emptyList(),
    /** Skips one of several node types that form a single call, such as Pascal's `exprCall(exprDot(...))`, against double counting. */
    val ignoreForMessageChainCall: List<IgnoreRule> = emptyList(),
    val countAsLeafNode: LeafNodeRule? = null
)
