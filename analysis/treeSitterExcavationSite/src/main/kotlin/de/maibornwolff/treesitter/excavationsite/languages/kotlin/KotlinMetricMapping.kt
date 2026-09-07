package de.maibornwolff.treesitter.excavationsite.languages.kotlin

import de.maibornwolff.treesitter.excavationsite.shared.domain.Metric
import de.maibornwolff.treesitter.excavationsite.shared.domain.MetricCondition
import de.maibornwolff.treesitter.excavationsite.shared.domain.MetricMapping

/**
 * Kotlin metric definitions.
 *
 * Metrics:
 * - Logic complexity: if, for, while, elvis, conjunctions, when entries, catch blocks
 * - Function complexity: function/lambda/constructor declarations
 * - Comments: line and multiline comments
 * - Functions: counted via nested matching on function_declaration with function_body
 * - Function bodies: for RLOC per function calculation
 * - Parameters: function parameter nodes
 * - Message chains: call and navigation expressions
 */
object KotlinMetricMapping : MetricMapping {
    override val nodeMetrics: Map<String, Set<Metric>> = buildMap {
        // Logic complexity nodes
        listOf(
            "if_expression",
            "for_statement",
            "while_statement",
            "do_while_statement",
            "elvis_expression",
            "conjunction_expression",
            "disjunction_expression",
            "when_entry",
            "catch_block"
        ).forEach { put(it, setOf(Metric.LogicComplexity)) }

        // Function complexity nodes (only complexity, not counted as functions)
        listOf(
            "anonymous_function",
            "anonymous_initializer",
            "lambda_literal"
        ).forEach { put(it, setOf(Metric.FunctionComplexity)) }

        // Function nodes that count for BOTH complexity AND number_of_functions
        listOf(
            "secondary_constructor",
            "setter",
            "getter"
        ).forEach { put(it, setOf(Metric.FunctionComplexity, Metric.Function)) }

        // Comment line nodes
        listOf("line_comment", "multiline_comment").forEach { put(it, setOf(Metric.CommentLine)) }

        // Function nodes with conditional matching requirements
        // property_declaration with 4 children and lambda/function/initializer at position 3
        put(
            "property_declaration",
            setOf(
                Metric.FunctionConditional(
                    MetricCondition.ChildPositionMatches(
                        position = 3,
                        requiredChildCount = 4,
                        allowedTypes = setOf("lambda_literal", "anonymous_function", "anonymous_initializer")
                    )
                )
            )
        )

        // function_declaration with function_body at various positions
        // Includes FunctionComplexity for complexity calculation plus conditional matching for function counting
        val functionDeclarationMetrics = setOf(
            Metric.FunctionComplexity,
            Metric.FunctionConditional(
                MetricCondition.ChildPositionMatches(
                    position = 3,
                    requiredChildCount = 4,
                    allowedTypes = setOf("function_body")
                )
            ),
            Metric.FunctionConditional(
                MetricCondition.ChildPositionMatches(
                    position = 4,
                    requiredChildCount = 5,
                    allowedTypes = setOf("function_body")
                )
            ),
            Metric.FunctionConditional(
                MetricCondition.ChildPositionMatches(
                    position = 5,
                    requiredChildCount = 6,
                    allowedTypes = setOf("function_body")
                )
            ),
            Metric.FunctionConditional(
                MetricCondition.ChildPositionMatches(
                    position = 6,
                    requiredChildCount = 7,
                    allowedTypes = setOf("function_body")
                )
            )
        )
        put("function_declaration", functionDeclarationMetrics)

        // Function body nodes
        put("function_body", setOf(Metric.FunctionBody))

        // Parameter nodes
        put("parameter", setOf(Metric.Parameter))

        // Message chain nodes
        put("call_expression", setOf(Metric.MessageChain, Metric.MessageChainCall))
        put("navigation_expression", setOf(Metric.MessageChain))
    }
}
