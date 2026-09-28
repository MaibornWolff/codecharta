package de.maibornwolff.treesitter.excavationsite.languages.csharp

import de.maibornwolff.treesitter.excavationsite.shared.domain.Metric
import de.maibornwolff.treesitter.excavationsite.shared.domain.MetricCondition
import de.maibornwolff.treesitter.excavationsite.shared.domain.MetricMapping

/**
 * C# metric definitions.
 */
object CSharpMetricMapping : MetricMapping {
    override val nodeMetrics: Map<String, Set<Metric>> = buildMap {
        // Logic complexity
        put("if_statement", setOf(Metric.LogicComplexity))
        put("do_statement", setOf(Metric.LogicComplexity))
        put("foreach_statement", setOf(Metric.LogicComplexity))
        put("for_statement", setOf(Metric.LogicComplexity))
        put("while_statement", setOf(Metric.LogicComplexity))
        put("conditional_expression", setOf(Metric.LogicComplexity))
        put("is_expression", setOf(Metric.LogicComplexity))
        put("and_pattern", setOf(Metric.LogicComplexity))
        put("or_pattern", setOf(Metric.LogicComplexity))
        put("switch_section", setOf(Metric.LogicComplexity))
        put("switch_expression_arm", setOf(Metric.LogicComplexity))
        put("catch_clause", setOf(Metric.LogicComplexity))

        // Logic complexity - conditional (binary expressions with &&, ||, ??)
        put(
            "binary_expression",
            setOf(
                Metric.LogicComplexityConditional(
                    MetricCondition.ChildFieldMatches(
                        fieldName = "operator",
                        allowedValues = setOf("&&", "||", "??")
                    )
                )
            )
        )

        // Function complexity
        put("constructor_declaration", setOf(Metric.FunctionComplexity, Metric.Function))
        put("method_declaration", setOf(Metric.FunctionComplexity, Metric.Function))
        put("lambda_expression", setOf(Metric.FunctionComplexity))
        put("local_function_statement", setOf(Metric.FunctionComplexity, Metric.Function))
        put("accessor_declaration", setOf(Metric.FunctionComplexity, Metric.Function))

        // Number of functions - variable declarator with lambda (conditional)
        put(
            "variable_declarator",
            setOf(
                Metric.FunctionConditional(
                    MetricCondition.ChildPositionMatches(
                        position = 2,
                        requiredChildCount = 3,
                        allowedTypes = setOf("lambda_expression")
                    )
                )
            )
        )

        // Function body
        put("block", setOf(Metric.FunctionBody))

        // Function parameters
        put("parameter", setOf(Metric.Parameter))

        // Message chains
        put("invocation_expression", setOf(Metric.MessageChain, Metric.MessageChainCall))
        put("member_access_expression", setOf(Metric.MessageChain))

        // Comment lines
        put("comment", setOf(Metric.CommentLine))
    }
}
