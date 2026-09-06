package de.maibornwolff.treesitter.excavationsite.shared.domain

/**
 * Declarative configuration for language-specific metric calculation behavior.
 *
 * This configuration is converted to CalculationExtensions by CalculationExtensionsFactory.
 * Language definitions use this to declare what behaviors they need without
 * depending on implementation details in the features layer.
 */
data class CalculationConfig(
    /**
     * Whether the language has explicit function body start/end nodes (like braces).
     * Python and Ruby use indentation, so they set this to false.
     */
    val hasFunctionBodyStartOrEndNode: Boolean = true,
    /**
     * Rules for ignoring nodes during complexity calculation.
     */
    val ignoreForComplexity: List<IgnoreRule> = emptyList(),
    /**
     * Rules for ignoring nodes during comment line calculation.
     */
    val ignoreForCommentLines: List<IgnoreRule> = emptyList(),
    /**
     * Rules for ignoring nodes during RLOC calculation.
     */
    val ignoreForRloc: List<IgnoreRule> = emptyList(),
    /**
     * Rules for ignoring nodes during parameter counting.
     */
    val ignoreForParameters: List<IgnoreRule> = emptyList(),
    /**
     * Rules for ignoring nodes during function counting.
     */
    val ignoreForNumberOfFunctions: List<IgnoreRule> = emptyList(),
    /**
     * Rules for ignoring nodes when counting them as a call inside a message-chain
     * detection. Used when a single source-level call is represented by multiple
     * AST node types (e.g., Pascal's `exprCall(exprDot(...))` for parenthesised calls)
     * and one of the node types must be skipped to avoid double-counting.
     */
    val ignoreForMessageChainCall: List<IgnoreRule> = emptyList(),
    /**
     * Rule for counting certain nodes as leaf nodes in RLOC calculation.
     */
    val countAsLeafNode: LeafNodeRule? = null
)
