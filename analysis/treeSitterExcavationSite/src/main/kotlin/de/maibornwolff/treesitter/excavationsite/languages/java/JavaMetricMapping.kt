package de.maibornwolff.treesitter.excavationsite.languages.java

import de.maibornwolff.treesitter.excavationsite.shared.domain.Metric
import de.maibornwolff.treesitter.excavationsite.shared.domain.MetricCondition
import de.maibornwolff.treesitter.excavationsite.shared.domain.MetricMapping

/**
 * Java metric definitions.
 */
object JavaMetricMapping : MetricMapping {
    override val nodeMetrics: Map<String, Set<Metric>> = buildMap {
        // Logic complexity
        put("if_statement", setOf(Metric.LogicComplexity))
        put("do_statement", setOf(Metric.LogicComplexity))
        put("for_statement", setOf(Metric.LogicComplexity))
        put("while_statement", setOf(Metric.LogicComplexity))
        put("enhanced_for_statement", setOf(Metric.LogicComplexity))
        put("ternary_expression", setOf(Metric.LogicComplexity))
        put("switch_label", setOf(Metric.LogicComplexity))
        put("catch_clause", setOf(Metric.LogicComplexity))

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
        put("constructor_declaration", setOf(Metric.FunctionComplexity, Metric.Function))
        put("method_declaration", setOf(Metric.FunctionComplexity, Metric.Function))
        put("lambda_expression", setOf(Metric.FunctionComplexity))
        put("static_initializer", setOf(Metric.FunctionComplexity))
        put("compact_constructor_declaration", setOf(Metric.FunctionComplexity, Metric.Function))

        // Number of functions - variable declarator with lambda (conditional)
        put(
            "variable_declarator",
            setOf(
                Metric.FunctionConditional(
                    MetricCondition.ChildFieldMatches(
                        fieldName = "value",
                        allowedValues = setOf("lambda_expression")
                    )
                )
            )
        )

        // Function body
        put("block", setOf(Metric.FunctionBody))

        // Function parameters
        put("formal_parameter", setOf(Metric.Parameter))

        // Message chains
        put("method_invocation", setOf(Metric.MessageChain, Metric.MessageChainCall))
        put("field_access", setOf(Metric.MessageChain))

        // Comment lines
        put("block_comment", setOf(Metric.CommentLine))
        put("line_comment", setOf(Metric.CommentLine))
    }
}
