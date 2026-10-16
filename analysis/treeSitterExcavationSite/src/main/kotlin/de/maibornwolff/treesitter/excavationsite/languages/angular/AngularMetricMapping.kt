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

    // The inputs `*ngIf`, `*ngFor` and `*ngSwitchCase` desugar to, written out on an `<ng-template>`
    private val STRUCTURAL_DIRECTIVE_INPUTS = setOf("ngIf", "ngForOf", "ngSwitchCase")

    override val nodeMetrics: Map<String, Set<Metric>> = buildMap {
        put(IF_STATEMENT, setOf(Metric.LogicComplexity))
        put(ELSE_IF_STATEMENT, setOf(Metric.LogicComplexity))
        put(FOR_STATEMENT, setOf(Metric.LogicComplexity))
        put(CASE_STATEMENT, setOf(Metric.LogicComplexity))
        put(DEFER_STATEMENT, setOf(Metric.LogicComplexity))
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

        put(CONDITIONAL_EXPRESSION, setOf(Metric.LogicComplexity))
        put(TERNARY_EXPRESSION, setOf(Metric.LogicComplexity))
        put(NULLISH_COALESCING_EXPRESSION, setOf(Metric.LogicComplexity))
        put(
            BINARY_EXPRESSION,
            setOf(
                Metric.LogicComplexityConditional(
                    MetricCondition.ChildFieldMatches(fieldName = OPERATOR_FIELD, allowedTypes = setOf("&&", "||"))
                )
            )
        )

        put(COMMENT, setOf(Metric.CommentLine))
    }
}
