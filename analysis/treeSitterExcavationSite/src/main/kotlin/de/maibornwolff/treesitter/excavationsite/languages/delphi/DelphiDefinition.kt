package de.maibornwolff.treesitter.excavationsite.languages.delphi

import de.maibornwolff.treesitter.excavationsite.shared.domain.CalculationConfig
import de.maibornwolff.treesitter.excavationsite.shared.domain.Extract
import de.maibornwolff.treesitter.excavationsite.shared.domain.IgnoreRule
import de.maibornwolff.treesitter.excavationsite.shared.domain.LanguageDefinition
import de.maibornwolff.treesitter.excavationsite.shared.domain.LanguageDependencyMapping
import de.maibornwolff.treesitter.excavationsite.shared.domain.Metric

/**
 * Unified Delphi language definition combining metrics, extraction, and dependencies.
 *
 * Composes DelphiMetricMapping, DelphiExtractionMapping, and DelphiDependencyMapping.
 */
object DelphiDefinition : LanguageDefinition {
    override val nodeMetrics: Map<String, Set<Metric>> = DelphiMetricMapping.nodeMetrics
    override val nodeExtractions: Map<String, Extract> = DelphiExtractionMapping.nodeExtractions
    override val dependencyMapping: LanguageDependencyMapping = DelphiDependencyMapping.dependencyMapping

    /**
     * Pascal renders parenthesised method invocations as `exprCall(entity=exprDot(...))`,
     * so both the `exprCall` and the inner `exprDot` would count as calls in a chain like
     * `A.b().c().d().e()` — doubling the chain count. The rule below skips `exprDot` when
     * its parent is `exprCall`; the `exprCall` mapping covers those cases. Paren-less
     * chains like `Obj.M1.M2.M3.M4` produce a top-level `exprDot` whose parent is NOT
     * `exprCall`, so they still count.
     */
    override val calculationConfig: CalculationConfig = CalculationConfig(
        ignoreForMessageChainCall = listOf(
            IgnoreRule.TypeWithParentType(nodeType = "exprDot", parentType = "exprCall")
        )
    )
}
