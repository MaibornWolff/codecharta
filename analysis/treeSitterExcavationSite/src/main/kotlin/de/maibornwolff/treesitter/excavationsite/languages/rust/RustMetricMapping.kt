package de.maibornwolff.treesitter.excavationsite.languages.rust

import de.maibornwolff.treesitter.excavationsite.shared.domain.Metric
import de.maibornwolff.treesitter.excavationsite.shared.domain.MetricCondition
import de.maibornwolff.treesitter.excavationsite.shared.domain.MetricMapping

/**
 * Rust metric definitions.
 */
object RustMetricMapping : MetricMapping {
    override val nodeMetrics: Map<String, Set<Metric>> = buildMap {
        // Logic complexity (if/while also cover their `let` forms)
        listOf("if_expression", "while_expression", "for_expression", "loop_expression", "match_arm")
            .forEach { put(it, setOf(Metric.LogicComplexity)) }

        // Logic complexity - conditional (binary expressions with && or ||)
        put(
            "binary_expression",
            setOf(
                Metric.LogicComplexityConditional(
                    MetricCondition.ChildFieldMatches(
                        fieldName = "operator",
                        allowedValues = setOf("&&", "||")
                    )
                )
            )
        )

        // Function complexity and number of functions (bodyless trait signatures included)
        listOf("function_item", "function_signature_item")
            .forEach { put(it, setOf(Metric.FunctionComplexity, Metric.Function)) }

        // Closures: complexity only, not counted as functions
        put("closure_expression", setOf(Metric.FunctionComplexity))

        // Function body (for RLOC per function)
        put("block", setOf(Metric.FunctionBody))

        // Parameters (self_parameter is a separate node, naturally excluded)
        put("parameter", setOf(Metric.Parameter))

        // Message chains
        put("call_expression", setOf(Metric.MessageChain, Metric.MessageChainCall))
        put("field_expression", setOf(Metric.MessageChain))

        // Comment lines
        listOf("line_comment", "block_comment").forEach { put(it, setOf(Metric.CommentLine)) }
    }
}
