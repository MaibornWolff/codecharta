package de.maibornwolff.treesitter.excavationsite.languages.javascript

import de.maibornwolff.treesitter.excavationsite.shared.domain.CalculationConfig
import de.maibornwolff.treesitter.excavationsite.shared.domain.Extract
import de.maibornwolff.treesitter.excavationsite.shared.domain.IgnoreRule
import de.maibornwolff.treesitter.excavationsite.shared.domain.LanguageDefinition
import de.maibornwolff.treesitter.excavationsite.shared.domain.LanguageDependencyMapping
import de.maibornwolff.treesitter.excavationsite.shared.domain.Metric

/**
 * Unified JavaScript language definition combining metrics and extraction.
 *
 * Composes JavascriptMetricMapping and JavascriptExtractionMapping.
 */
object JavascriptDefinition : LanguageDefinition {
    override val nodeMetrics: Map<String, Set<Metric>> = JavascriptMetricMapping.nodeMetrics
    override val nodeExtractions: Map<String, Extract> = JavascriptExtractionMapping.nodeExtractions

    private const val FUNCTION_DECLARATION = "function_declaration"

    override val calculationConfig = CalculationConfig(
        ignoreForParameters = listOf(
            IgnoreRule.TypeWithParentType(IDENTIFIER, FUNCTION_DECLARATION)
        )
    )

    override val dependencyMapping: LanguageDependencyMapping = JavascriptDependencyMapping.dependencyMapping
}
