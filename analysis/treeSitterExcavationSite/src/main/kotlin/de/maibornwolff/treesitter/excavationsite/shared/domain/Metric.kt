package de.maibornwolff.treesitter.excavationsite.shared.domain

/**
 * Represents what a node contributes to code metrics.
 *
 * Each metric type defines a specific contribution that a node can make
 * when encountered during AST traversal.
 */
sealed class Metric {
    /** Node contributes to cyclomatic complexity (if, for, while, etc.). */
    data object LogicComplexity : Metric()

    /** Node contributes to logic complexity with conditional matching (e.g., binary expressions with &&, ||). */
    data class LogicComplexityConditional(val condition: MetricCondition) : Metric()

    /** Node is a function definition that contributes to complexity count. */
    data object FunctionComplexity : Metric()

    /** Node is a comment (line or block). */
    data object CommentLine : Metric()

    /** Node is a comment with conditional matching requirements (e.g., Python docstrings). */
    data class CommentLineConditional(val condition: MetricCondition) : Metric()

    /** Node is a function declaration (simple match). */
    data object Function : Metric()

    /** Node is a function declaration with conditional matching requirements. */
    data class FunctionConditional(val condition: MetricCondition) : Metric()

    /** Node marks function body boundaries (for RLOC per function). */
    data object FunctionBody : Metric()

    /** Node is a function parameter. */
    data object Parameter : Metric()

    /** Node is part of a method chain (navigation/member expression). */
    data object MessageChain : Metric()

    /** Node is an actual call in a method chain. */
    data object MessageChainCall : Metric()
}
