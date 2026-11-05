package de.maibornwolff.treesitter.excavationsite.languages.vba

import de.maibornwolff.treesitter.excavationsite.shared.domain.Metric
import de.maibornwolff.treesitter.excavationsite.shared.domain.MetricCondition
import de.maibornwolff.treesitter.excavationsite.shared.domain.MetricMapping

object VbaMetricMapping : MetricMapping {
    private const val IDENTIFIER = "identifier"
    const val QUALIFIED_MEMBER_EXPRESSION = "qualified_member_expression"
    const val CALL_EXPRESSION = "call_expression"
    private val messageChainMetrics = setOf(Metric.MessageChain, Metric.MessageChainCall)
    private val handlerDisablingLineNumbers = setOf("0", "-1")
    private val logicalOperators = setOf("And", "Or", "Xor", "Eqv", "Imp")

    override val nodeMetrics: Map<String, Set<Metric>> = buildMap {
        listOf(
            "if_statement",
            "elseif_fragment",
            "single_line_if_statement",
            "case_clause",
            "for_statement",
            "for_each_statement",
            "do_statement",
            "while_statement"
        ).forEach { put(it, setOf(Metric.LogicComplexity)) }

        listOf("binary_expression", "condition_binary_expression", "logical_value_expression").forEach {
            put(it, setOf(Metric.LogicComplexityConditional(MetricCondition.HiddenOperatorMatches(logicalOperators))))
        }

        put(
            "on_error_statement",
            setOf(
                Metric.LogicComplexityConditional(MetricCondition.AnyChildMatches(setOf(IDENTIFIER))),
                Metric.LogicComplexityConditional(MetricCondition.ChildTextDiffers("line_number_literal", handlerDisablingLineNumbers))
            )
        )
        put(
            CALL_EXPRESSION,
            setOf(Metric.LogicComplexityConditional(MetricCondition.ChildTextMatches(IDENTIFIER, setOf("IIf"), ignoreCase = true)))
        )

        listOf(
            "sub_declaration",
            "function_declaration",
            "property_get_declaration",
            "property_let_declaration",
            "property_set_declaration",
            "conditional_sub_declaration",
            "conditional_function_declaration",
            "conditional_property_declaration"
        ).forEach { put(it, setOf(Metric.FunctionComplexity, Metric.Function)) }

        put("block", setOf(Metric.FunctionBody))
        put("parameter", setOf(Metric.Parameter))
        put("comment", setOf(Metric.CommentLine))

        listOf(QUALIFIED_MEMBER_EXPRESSION, CALL_EXPRESSION).forEach { put(it, getOrDefault(it, emptySet()) + messageChainMetrics) }
    }
}
