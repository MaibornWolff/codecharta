package de.maibornwolff.treesitter.excavationsite.languages.ruby

import de.maibornwolff.treesitter.excavationsite.shared.domain.Metric
import de.maibornwolff.treesitter.excavationsite.shared.domain.MetricCondition
import de.maibornwolff.treesitter.excavationsite.shared.domain.MetricMapping

/**
 * Ruby metric definitions.
 */
object RubyMetricMapping : MetricMapping {
    override val nodeMetrics: Map<String, Set<Metric>> = buildMap {
        // Logic complexity - simple
        put("if", setOf(Metric.LogicComplexity))
        put("elsif", setOf(Metric.LogicComplexity))
        put("for", setOf(Metric.LogicComplexity))
        put("until", setOf(Metric.LogicComplexity))
        put("while", setOf(Metric.LogicComplexity))
        put("do_block", setOf(Metric.LogicComplexity))
        put("conditional", setOf(Metric.LogicComplexity))
        put("when", setOf(Metric.LogicComplexity))
        put("else", setOf(Metric.LogicComplexity))
        put("rescue", setOf(Metric.LogicComplexity))

        // Logic complexity - conditional (binary with &&, ||, and, or)
        put(
            "binary",
            setOf(
                Metric.LogicComplexityConditional(
                    MetricCondition.ChildFieldMatches(
                        fieldName = "operator",
                        allowedValues = setOf("&&", "||", "and", "or")
                    )
                )
            )
        )

        // Function complexity
        put("lambda", setOf(Metric.FunctionComplexity))
        put("method", setOf(Metric.FunctionComplexity, Metric.Function))
        put("singleton_method", setOf(Metric.FunctionComplexity, Metric.Function))

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

        // Comment lines
        put("comment", setOf(Metric.CommentLine))

        // Function body
        put("body_statement", setOf(Metric.FunctionBody))

        // Function parameters
        put("identifier", setOf(Metric.Parameter))

        // Message chains
        put("call", setOf(Metric.MessageChain, Metric.MessageChainCall))
    }
}
