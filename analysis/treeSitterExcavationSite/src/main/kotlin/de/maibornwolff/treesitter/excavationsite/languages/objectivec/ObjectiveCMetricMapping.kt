package de.maibornwolff.treesitter.excavationsite.languages.objectivec

import de.maibornwolff.treesitter.excavationsite.shared.domain.Metric
import de.maibornwolff.treesitter.excavationsite.shared.domain.MetricCondition
import de.maibornwolff.treesitter.excavationsite.shared.domain.MetricMapping

/**
 * Objective-C metric definitions.
 */
object ObjectiveCMetricMapping : MetricMapping {
    private const val FUNCTION_DEFINITION = "function_definition"
    private const val METHOD_DEFINITION = "method_definition"
    private const val PARAMETER_DECLARATION = "parameter_declaration"
    private const val KEYWORD_DECLARATOR = "keyword_declarator"
    private const val CATCH_CLAUSE = "@catch"

    override val nodeMetrics: Map<String, Set<Metric>> = buildMap {
        // Logic complexity
        put("if_statement", setOf(Metric.LogicComplexity))
        put("for_statement", setOf(Metric.LogicComplexity))
        put("while_statement", setOf(Metric.LogicComplexity))
        put("do_statement", setOf(Metric.LogicComplexity))
        put("case_statement", setOf(Metric.LogicComplexity))
        put(CATCH_CLAUSE, setOf(Metric.LogicComplexity))
        put("conditional_expression", setOf(Metric.LogicComplexity))

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
        put(FUNCTION_DEFINITION, setOf(Metric.FunctionComplexity, Metric.Function))
        put("block_expression", setOf(Metric.FunctionComplexity))
        put(METHOD_DEFINITION, setOf(Metric.Function))

        // Function body
        put("compound_statement", setOf(Metric.FunctionBody))

        // Function parameters
        put(PARAMETER_DECLARATION, setOf(Metric.Parameter))
        put(KEYWORD_DECLARATOR, setOf(Metric.Parameter))

        // Message chains
        put("call_expression", setOf(Metric.MessageChain, Metric.MessageChainCall))
        put("field_expression", setOf(Metric.MessageChain))
        put("message_expression", setOf(Metric.MessageChain, Metric.MessageChainCall))

        // Comment lines
        put("comment", setOf(Metric.CommentLine))
    }
}
