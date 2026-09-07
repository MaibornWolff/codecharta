package de.maibornwolff.treesitter.excavationsite.languages.cpp

import de.maibornwolff.treesitter.excavationsite.shared.domain.Metric
import de.maibornwolff.treesitter.excavationsite.shared.domain.MetricCondition
import de.maibornwolff.treesitter.excavationsite.shared.domain.MetricMapping

/**
 * C++ metric definitions.
 */
object CppMetricMapping : MetricMapping {
    override val nodeMetrics: Map<String, Set<Metric>> = buildMap {
        // Logic complexity - simple nodes
        put("if_statement", setOf(Metric.LogicComplexity))
        put("do_statement", setOf(Metric.LogicComplexity))
        put("for_statement", setOf(Metric.LogicComplexity))
        put("while_statement", setOf(Metric.LogicComplexity))
        put("for_range_loop", setOf(Metric.LogicComplexity))
        put("conditional_expression", setOf(Metric.LogicComplexity))
        put("case_statement", setOf(Metric.LogicComplexity))
        put("catch_clause", setOf(Metric.LogicComplexity))
        put("seh_except_clause", setOf(Metric.LogicComplexity))

        // Logic complexity - conditional (binary expressions with && || and or xor)
        put(
            "binary_expression",
            setOf(
                Metric.LogicComplexityConditional(
                    MetricCondition.ChildFieldMatches(
                        fieldName = "operator",
                        allowedValues = setOf("&&", "||", "and", "or", "xor")
                    )
                )
            )
        )

        // Function complexity
        put("lambda_expression", setOf(Metric.FunctionComplexity))
        put("function_definition", setOf(Metric.FunctionComplexity, Metric.Function))
        put("abstract_function_declarator", setOf(Metric.FunctionComplexity))
        put("function_declarator", setOf(Metric.FunctionComplexity))

        // Comment lines
        put("comment", setOf(Metric.CommentLine))

        // Number of functions - init_declarator with lambda (conditional)
        put(
            "init_declarator",
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
        put("compound_statement", setOf(Metric.FunctionBody))

        // Function parameters
        put("parameter_declaration", setOf(Metric.Parameter))

        // Message chains
        put("call_expression", setOf(Metric.MessageChain, Metric.MessageChainCall))
        put("field_expression", setOf(Metric.MessageChain))
    }
}
