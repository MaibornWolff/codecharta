package de.maibornwolff.treesitter.excavationsite.languages.angular

import de.maibornwolff.treesitter.excavationsite.shared.domain.Metric
import de.maibornwolff.treesitter.excavationsite.shared.domain.MetricCondition
import de.maibornwolff.treesitter.excavationsite.shared.domain.MetricMapping

/**
 * Angular template metric definitions. A template declares no functions, so its complexity is the decisions of its
 * control flow blocks, structural directives and binding expressions.
 */
object AngularMetricMapping : MetricMapping {
    // The fallback of an ICU message, like the default of a switch
    private const val ICU_OTHER_CATEGORY = "other"
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
            ICU_CASE,
            setOf(Metric.LogicComplexityConditional(MetricCondition.ChildTextDiffers(ICU_CATEGORY, setOf(ICU_OTHER_CATEGORY))))
        )

        put(
            STRUCTURAL_DIRECTIVE,
            setOf(Metric.LogicComplexityConditional(MetricCondition.ChildTextMatches(IDENTIFIER, STRUCTURAL_DIRECTIVES)))
        )
        put(
            PROPERTY_BINDING,
            setOf(Metric.LogicComplexityConditional(MetricCondition.ChildTextMatches(BINDING_NAME, STRUCTURAL_DIRECTIVE_INPUTS)))
        )

        put("conditional_expression", setOf(Metric.LogicComplexity))
        put("ternary_expression", setOf(Metric.LogicComplexity))
        put("nullish_coalescing_expression", setOf(Metric.LogicComplexity))
        put(
            BINARY_EXPRESSION,
            setOf(
                Metric.LogicComplexityConditional(
                    MetricCondition.ChildFieldMatches(fieldName = OPERATOR_FIELD, allowedValues = setOf("&&", "||"))
                )
            )
        )

        put(COMMENT, setOf(Metric.CommentLine))
    }
}
