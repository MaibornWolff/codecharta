package de.maibornwolff.treesitter.excavationsite.languages.abl

import de.maibornwolff.treesitter.excavationsite.shared.domain.Metric
import de.maibornwolff.treesitter.excavationsite.shared.domain.MetricCondition
import de.maibornwolff.treesitter.excavationsite.shared.domain.MetricMapping

/**
 * ABL (OpenEdge ABL/Progress 4GL) metric definitions.
 */
object AblMetricMapping : MetricMapping {
    override val nodeMetrics: Map<String, Set<Metric>> = buildMap {
        // Logic complexity - control flow statements
        put("if_statement", setOf(Metric.LogicComplexity))
        put("case_statement", setOf(Metric.LogicComplexity))
        put("case_when_clause", setOf(Metric.LogicComplexity))
        put("case_otherwise_clause", setOf(Metric.LogicComplexity))
        put("repeat_statement", setOf(Metric.LogicComplexity))
        put("for_each_statement", setOf(Metric.LogicComplexity))
        put("do_block", setOf(Metric.LogicComplexity))
        put("catch_statement", setOf(Metric.LogicComplexity))
        put("conditional_expression", setOf(Metric.LogicComplexity))

        // Logic complexity - conditional (binary expressions with AND or OR)
        put(
            "binary_expression",
            setOf(
                Metric.LogicComplexityConditional(
                    MetricCondition.ChildFieldMatches(
                        fieldName = "operator",
                        allowedValues = setOf("AND", "OR", "and", "or")
                    )
                )
            )
        )

        // Function complexity and number of functions - procedures, functions, methods, constructors
        put("procedure_definition", setOf(Metric.FunctionComplexity, Metric.Function))
        put("function_definition", setOf(Metric.FunctionComplexity, Metric.Function))
        put("method_definition", setOf(Metric.FunctionComplexity, Metric.Function))
        put("constructor_definition", setOf(Metric.FunctionComplexity, Metric.Function))

        // Note: ABL procedures/functions don't have separate body wrapper nodes in the AST.
        // Content is directly under the definition node. Per-function RLOC uses
        // calculationConfig.hasFunctionBodyStartOrEndNode = false to handle this.

        // Comment lines (need both parent and children as walker visits all nodes)
        put("comment", setOf(Metric.CommentLine))
        put("line_comment", setOf(Metric.CommentLine))
        put("block_comment", setOf(Metric.CommentLine))

        // Parameters
        put("parameter_definition", setOf(Metric.Parameter))
        put("method_parameter", setOf(Metric.Parameter))
        put("function_parameter", setOf(Metric.Parameter))

        // Message chains (method chaining with : separator)
        put("object_access", setOf(Metric.MessageChain, Metric.MessageChainCall))
    }
}
