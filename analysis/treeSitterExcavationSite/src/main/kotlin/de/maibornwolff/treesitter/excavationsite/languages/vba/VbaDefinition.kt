package de.maibornwolff.treesitter.excavationsite.languages.vba

import de.maibornwolff.treesitter.excavationsite.shared.domain.CalculationConfig
import de.maibornwolff.treesitter.excavationsite.shared.domain.Extract
import de.maibornwolff.treesitter.excavationsite.shared.domain.IgnoreRule
import de.maibornwolff.treesitter.excavationsite.shared.domain.LanguageDefinition
import de.maibornwolff.treesitter.excavationsite.shared.domain.LanguageDependencyMapping
import de.maibornwolff.treesitter.excavationsite.shared.domain.Metric

/** VBA and VB6: the grammars `vba` and `vb6` share their core, so both use this definition. */
object VbaDefinition : LanguageDefinition {
    override val nodeMetrics: Map<String, Set<Metric>> = VbaMetricMapping.nodeMetrics
    override val nodeExtractions: Map<String, Extract> = VbaExtractionMapping.nodeExtractions
    override val dependencyMapping: LanguageDependencyMapping? = null

    override val calculationConfig = CalculationConfig(
        hasFunctionBodyStartOrEndNode = false,
        ignoreForRloc = listOf(IgnoreRule.LineBreakAfterNoCode(lineBreakType = "newline", nonCodeTypes = setOf("comment"))),
        ignoreForMessageChainCall = listOf(
            IgnoreRule.TypeWithParentType(VbaMetricMapping.QUALIFIED_MEMBER_EXPRESSION, VbaMetricMapping.CALL_EXPRESSION)
        )
    )
}
