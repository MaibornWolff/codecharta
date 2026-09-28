package de.maibornwolff.treesitter.excavationsite.languages.python

import de.maibornwolff.treesitter.excavationsite.shared.domain.Metric
import de.maibornwolff.treesitter.excavationsite.shared.domain.MetricCondition
import de.maibornwolff.treesitter.excavationsite.shared.domain.MetricMapping

/**
 * Python metric definitions.
 */
object PythonMetricMapping : MetricMapping {
    override val nodeMetrics: Map<String, Set<Metric>> = buildMap {
        // Logic complexity - simple nodes
        listOf(
            "if_statement",
            "elif_clause",
            "if_clause",
            "for_statement",
            "while_statement",
            "for_in_clause",
            "conditional_expression",
            "list",
            "boolean_operator",
            "case_pattern",
            "except_clause"
        ).forEach { put(it, setOf(Metric.LogicComplexity)) }

        // Logic complexity - conditional lambda with 4 children
        put(
            "lambda",
            setOf(
                Metric.LogicComplexityConditional(
                    MetricCondition.ChildPositionMatches(
                        position = 0,
                        requiredChildCount = 4,
                        allowedTypes = setOf("lambda")
                    )
                )
            )
        )

        // Function complexity and number of functions
        put("function_definition", setOf(Metric.FunctionComplexity, Metric.Function))

        // Comment lines - simple comment
        put("comment", setOf(Metric.CommentLine))

        // Comment lines - docstring (expression_statement with string child)
        put(
            "expression_statement",
            setOf(
                Metric.CommentLineConditional(
                    MetricCondition.ChildPositionMatches(
                        position = 0,
                        requiredChildCount = 1,
                        allowedTypes = setOf("string")
                    )
                )
            )
        )

        // Number of functions - assignment with lambda (conditional)
        put(
            "assignment",
            setOf(
                Metric.FunctionConditional(
                    MetricCondition.ChildFieldMatches(
                        fieldName = "right",
                        allowedValues = setOf("lambda")
                    )
                )
            )
        )

        // Function body
        put("block", setOf(Metric.FunctionBody))

        // Function parameters
        put("identifier", setOf(Metric.Parameter))

        // Message chains
        put("call", setOf(Metric.MessageChain, Metric.MessageChainCall))
        put("attribute", setOf(Metric.MessageChain))
    }
}
