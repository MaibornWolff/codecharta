package de.maibornwolff.treesitter.excavationsite.languages.kotlin

import de.maibornwolff.treesitter.excavationsite.shared.domain.Metric
import de.maibornwolff.treesitter.excavationsite.shared.domain.MetricCondition
import de.maibornwolff.treesitter.excavationsite.shared.domain.MetricMapping

/**
 * Kotlin metric definitions.
 *
 * Metrics:
 * - Logic complexity: if, for, while, elvis, conjunctions, when entries, catch blocks
 * - Function complexity: function/lambda/constructor declarations
 * - Comments: line and multiline comments
 * - Functions: function_declaration with a function_body, accessors and secondary constructors; no lambda
 * - Function bodies: for RLOC per function calculation, the statements of a secondary constructor included
 * - Parameters: function parameter nodes
 * - Message chains: call and navigation expressions
 */
object KotlinMetricMapping : MetricMapping {
    override val nodeMetrics: Map<String, Set<Metric>> = buildMap {
        // Logic complexity nodes
        listOf(
            "if_expression",
            "for_statement",
            "while_statement",
            "do_while_statement",
            "elvis_expression",
            "conjunction_expression",
            "disjunction_expression",
            "when_entry",
            "catch_block"
        ).forEach { put(it, setOf(Metric.LogicComplexity)) }

        // Function complexity nodes (only complexity, not counted as functions)
        listOf(
            "anonymous_function",
            "anonymous_initializer",
            "lambda_literal"
        ).forEach { put(it, setOf(Metric.FunctionComplexity)) }

        // Function nodes that count for BOTH complexity AND number_of_functions
        listOf(
            "secondary_constructor",
            "setter",
            "getter"
        ).forEach { put(it, setOf(Metric.FunctionComplexity, Metric.Function)) }

        // Comment line nodes
        listOf("line_comment", "multiline_comment").forEach { put(it, setOf(Metric.CommentLine)) }

        put(
            "function_declaration",
            setOf(Metric.FunctionComplexity, Metric.FunctionConditional(MetricCondition.AnyChildMatches(setOf("function_body"))))
        )

        put("function_body", setOf(Metric.FunctionBody))
        put("statements", setOf(Metric.FunctionBodyConditional(MetricCondition.ParentMatches(setOf("secondary_constructor")))))

        // Parameter nodes
        put("parameter", setOf(Metric.Parameter))

        // Message chain nodes
        put("call_expression", setOf(Metric.MessageChain, Metric.MessageChainCall))
        put("navigation_expression", setOf(Metric.MessageChain))
    }
}
