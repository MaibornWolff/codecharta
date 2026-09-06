package de.maibornwolff.treesitter.excavationsite.languages.swift

import de.maibornwolff.treesitter.excavationsite.shared.domain.Metric
import de.maibornwolff.treesitter.excavationsite.shared.domain.MetricMapping

/**
 * Swift metric definitions.
 */
object SwiftMetricMapping : MetricMapping {
    override val nodeMetrics: Map<String, Set<Metric>> = buildMap {
        // Logic complexity
        put("if_statement", setOf(Metric.LogicComplexity))
        put("guard_statement", setOf(Metric.LogicComplexity))
        put("for_statement", setOf(Metric.LogicComplexity))
        put("while_statement", setOf(Metric.LogicComplexity))
        put("repeat_while_statement", setOf(Metric.LogicComplexity))
        put("switch_entry", setOf(Metric.LogicComplexity))
        put("catch_block", setOf(Metric.LogicComplexity))
        put("defer_statement", setOf(Metric.LogicComplexity))
        put("nil_coalescing_expression", setOf(Metric.LogicComplexity))
        put("conjunction_expression", setOf(Metric.LogicComplexity))
        put("disjunction_expression", setOf(Metric.LogicComplexity))
        put("ternary_expression", setOf(Metric.LogicComplexity))
        put("willset_clause", setOf(Metric.LogicComplexity))
        put("didset_clause", setOf(Metric.LogicComplexity))

        // Function complexity and number of functions
        put("function_declaration", setOf(Metric.FunctionComplexity, Metric.Function))
        put("init_declaration", setOf(Metric.FunctionComplexity, Metric.Function))
        put("deinit_declaration", setOf(Metric.FunctionComplexity, Metric.Function))
        put("lambda_literal", setOf(Metric.FunctionComplexity))
        put("subscript_declaration", setOf(Metric.FunctionComplexity))
        put("computed_getter", setOf(Metric.FunctionComplexity, Metric.Function))
        put("computed_setter", setOf(Metric.FunctionComplexity, Metric.Function))

        // Function body
        put("function_body", setOf(Metric.FunctionBody))
        put("code_block", setOf(Metric.FunctionBody))

        // Function parameters
        put("parameter", setOf(Metric.Parameter))

        // Message chains
        put("call_expression", setOf(Metric.MessageChain, Metric.MessageChainCall))
        put("navigation_expression", setOf(Metric.MessageChain))

        // Comment lines
        put("comment", setOf(Metric.CommentLine))
        put("multiline_comment", setOf(Metric.CommentLine))
    }
}
