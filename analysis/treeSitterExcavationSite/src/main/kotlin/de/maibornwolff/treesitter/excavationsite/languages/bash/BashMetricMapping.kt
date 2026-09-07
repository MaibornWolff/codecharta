package de.maibornwolff.treesitter.excavationsite.languages.bash

import de.maibornwolff.treesitter.excavationsite.shared.domain.Metric
import de.maibornwolff.treesitter.excavationsite.shared.domain.MetricCondition
import de.maibornwolff.treesitter.excavationsite.shared.domain.MetricMapping

/**
 * Bash metric definitions.
 */
object BashMetricMapping : MetricMapping {
    override val nodeMetrics: Map<String, Set<Metric>> = buildMap {
        // Logic complexity
        put("if_statement", setOf(Metric.LogicComplexity))
        put("elif_clause", setOf(Metric.LogicComplexity))
        put("for_statement", setOf(Metric.LogicComplexity))
        put("while_statement", setOf(Metric.LogicComplexity))
        put("c_style_for_statement", setOf(Metric.LogicComplexity))
        put("ternary_expression", setOf(Metric.LogicComplexity))
        put("list", setOf(Metric.LogicComplexity))
        put("case_item", setOf(Metric.LogicComplexity))

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

        // Function complexity and number of functions
        put("function_definition", setOf(Metric.FunctionComplexity, Metric.Function))

        // Function body
        put("compound_statement", setOf(Metric.FunctionBody))

        // Comment lines
        put("comment", setOf(Metric.CommentLine))
    }
}
