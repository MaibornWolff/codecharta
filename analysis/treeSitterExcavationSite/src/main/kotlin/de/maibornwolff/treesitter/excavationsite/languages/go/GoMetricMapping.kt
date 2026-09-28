package de.maibornwolff.treesitter.excavationsite.languages.go

import de.maibornwolff.treesitter.excavationsite.shared.domain.Metric
import de.maibornwolff.treesitter.excavationsite.shared.domain.MetricCondition
import de.maibornwolff.treesitter.excavationsite.shared.domain.MetricMapping

/**
 * Go metric definitions.
 */
object GoMetricMapping : MetricMapping {
    override val nodeMetrics: Map<String, Set<Metric>> = buildMap {
        // Logic complexity
        put("if_statement", setOf(Metric.LogicComplexity))
        put("for_statement", setOf(Metric.LogicComplexity))
        put("communication_case", setOf(Metric.LogicComplexity))
        put("expression_case", setOf(Metric.LogicComplexity))
        put("type_case", setOf(Metric.LogicComplexity))
        put("default_case", setOf(Metric.LogicComplexity))

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
        put("method_declaration", setOf(Metric.FunctionComplexity, Metric.Function))
        put("func_literal", setOf(Metric.FunctionComplexity, Metric.Function))
        put("function_declaration", setOf(Metric.FunctionComplexity, Metric.Function))
        put("method_spec", setOf(Metric.FunctionComplexity, Metric.Function))

        // Function body
        put("block", setOf(Metric.FunctionBody))

        // Function parameters
        put("parameter_declaration", setOf(Metric.Parameter))

        // Message chains
        put("call_expression", setOf(Metric.MessageChain, Metric.MessageChainCall))
        put("selector_expression", setOf(Metric.MessageChain))

        // Comment lines
        put("comment", setOf(Metric.CommentLine))
    }
}
