package de.maibornwolff.treesitter.excavationsite.languages.angular

import de.maibornwolff.treesitter.excavationsite.shared.domain.Metric
import de.maibornwolff.treesitter.excavationsite.shared.domain.MetricCondition
import de.maibornwolff.treesitter.excavationsite.shared.domain.MetricMapping

/**
 * Angular template metric definitions. A template declares no functions, so its complexity is the decisions of its
 * control flow blocks, structural directives and binding expressions.
 */
object AngularMetricMapping : MetricMapping {
    private const val IDENTIFIER = "identifier"
    private const val BINDING_NAME = "binding_name"
    private val STRUCTURAL_DIRECTIVES = setOf("ngIf", "ngFor", "ngSwitchCase")

    // The inputs `*ngIf` and `*ngFor` desugar to, written out on an `<ng-template>`
    private val STRUCTURAL_DIRECTIVE_INPUTS = setOf("ngIf", "ngForOf", "ngSwitchCase")

    override val nodeMetrics: Map<String, Set<Metric>> = buildMap {
        put("if_statement", setOf(Metric.LogicComplexity))
        put("else_if_statement", setOf(Metric.LogicComplexity))
        put("for_statement", setOf(Metric.LogicComplexity))
        put("case_statement", setOf(Metric.LogicComplexity))
        put("defer_statement", setOf(Metric.LogicComplexity))

        put(
            "structural_directive",
            setOf(Metric.LogicComplexityConditional(MetricCondition.ChildTextMatches(IDENTIFIER, STRUCTURAL_DIRECTIVES)))
        )
        put(
            "property_binding",
            setOf(Metric.LogicComplexityConditional(MetricCondition.ChildTextMatches(BINDING_NAME, STRUCTURAL_DIRECTIVE_INPUTS)))
        )

        put("conditional_expression", setOf(Metric.LogicComplexity))
        put("ternary_expression", setOf(Metric.LogicComplexity))
        put("nullish_coalescing_expression", setOf(Metric.LogicComplexity))
        put(
            "binary_expression",
            setOf(
                Metric.LogicComplexityConditional(
                    MetricCondition.ChildFieldMatches(fieldName = "operator", allowedValues = setOf("&&", "||"))
                )
            )
        )

        put("comment", setOf(Metric.CommentLine))
    }
}
