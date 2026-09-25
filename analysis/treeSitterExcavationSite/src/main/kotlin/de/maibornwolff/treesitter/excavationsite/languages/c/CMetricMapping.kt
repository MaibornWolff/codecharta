package de.maibornwolff.treesitter.excavationsite.languages.c

import de.maibornwolff.treesitter.excavationsite.shared.domain.Metric
import de.maibornwolff.treesitter.excavationsite.shared.domain.MetricCondition
import de.maibornwolff.treesitter.excavationsite.shared.domain.MetricMapping

/**
 * C metric definitions.
 */
object CMetricMapping : MetricMapping {
    override val nodeMetrics: Map<String, Set<Metric>> = buildMap {
        // Logic complexity
        put("if_statement", setOf(Metric.LogicComplexity))
        put("do_statement", setOf(Metric.LogicComplexity))
        put("for_statement", setOf(Metric.LogicComplexity))
        put("while_statement", setOf(Metric.LogicComplexity))
        put("conditional_expression", setOf(Metric.LogicComplexity))
        put("case_statement", setOf(Metric.LogicComplexity))
        put("seh_except_clause", setOf(Metric.LogicComplexity))

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

        // Function complexity
        put("function_definition", setOf(Metric.FunctionComplexity, Metric.Function))
        put("abstract_function_declarator", setOf(Metric.FunctionComplexity))
        put("function_declarator", setOf(Metric.FunctionComplexity))

        // Function body
        put("compound_statement", setOf(Metric.FunctionBody))

        // Function parameters
        put("parameter_declaration", setOf(Metric.Parameter))

        // Message chains
        put("call_expression", setOf(Metric.MessageChain, Metric.MessageChainCall))
        put("field_expression", setOf(Metric.MessageChain))

        // Comment lines
        put("comment", setOf(Metric.CommentLine))
    }
}
