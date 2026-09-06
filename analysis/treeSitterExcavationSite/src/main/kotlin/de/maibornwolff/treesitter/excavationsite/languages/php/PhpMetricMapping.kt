package de.maibornwolff.treesitter.excavationsite.languages.php

import de.maibornwolff.treesitter.excavationsite.shared.domain.Metric
import de.maibornwolff.treesitter.excavationsite.shared.domain.MetricCondition
import de.maibornwolff.treesitter.excavationsite.shared.domain.MetricMapping

/**
 * PHP metric definitions.
 */
object PhpMetricMapping : MetricMapping {
    override val nodeMetrics: Map<String, Set<Metric>> = buildMap {
        // Logic complexity - simple
        put("if_statement", setOf(Metric.LogicComplexity))
        put("else_if_clause", setOf(Metric.LogicComplexity))
        put("do_statement", setOf(Metric.LogicComplexity))
        put("for_statement", setOf(Metric.LogicComplexity))
        put("while_statement", setOf(Metric.LogicComplexity))
        put("foreach_statement", setOf(Metric.LogicComplexity))
        put("conditional_expression", setOf(Metric.LogicComplexity))
        put("case_statement", setOf(Metric.LogicComplexity))
        put("default_statement", setOf(Metric.LogicComplexity))
        put("match_conditional_expression", setOf(Metric.LogicComplexity))
        put("match_default_expression", setOf(Metric.LogicComplexity))
        put("catch_clause", setOf(Metric.LogicComplexity))

        // Logic complexity - conditional (binary expressions with logical operators)
        put(
            "binary_expression",
            setOf(
                Metric.LogicComplexityConditional(
                    MetricCondition.ChildFieldMatches(
                        fieldName = "operator",
                        allowedValues = setOf("&&", "||", "??", "and", "or", "xor")
                    )
                )
            )
        )

        // Function complexity
        put("method_declaration", setOf(Metric.FunctionComplexity, Metric.Function))
        put("lambda_expression", setOf(Metric.FunctionComplexity))
        put("arrow_function", setOf(Metric.FunctionComplexity))
        put("anonymous_function", setOf(Metric.FunctionComplexity))
        put("function_definition", setOf(Metric.FunctionComplexity, Metric.Function))
        put("function_static_declaration", setOf(Metric.FunctionComplexity, Metric.Function))

        // Number of functions - assignment with function (conditional)
        put(
            "assignment_expression",
            setOf(
                Metric.FunctionConditional(
                    MetricCondition.ChildFieldMatches(
                        fieldName = "right",
                        allowedValues = setOf("anonymous_function", "arrow_function", "lambda_expression")
                    )
                )
            )
        )

        // Function body
        put("compound_statement", setOf(Metric.FunctionBody))

        // Function parameters
        put("simple_parameter", setOf(Metric.Parameter))

        // Message chains
        put("member_call_expression", setOf(Metric.MessageChain, Metric.MessageChainCall))
        put("scoped_call_expression", setOf(Metric.MessageChain, Metric.MessageChainCall))
        put("member_access_expression", setOf(Metric.MessageChain))

        // Comment lines
        put("comment", setOf(Metric.CommentLine))
    }
}
