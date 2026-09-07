package de.maibornwolff.treesitter.excavationsite.languages.c

import de.maibornwolff.treesitter.excavationsite.shared.domain.CalculationConfig
import de.maibornwolff.treesitter.excavationsite.shared.domain.Extract
import de.maibornwolff.treesitter.excavationsite.shared.domain.IgnoreRule
import de.maibornwolff.treesitter.excavationsite.shared.domain.LanguageDefinition
import de.maibornwolff.treesitter.excavationsite.shared.domain.Metric

/**
 * Unified C language definition combining metrics and extraction.
 *
 * Composes CMetricMapping and CExtractionMapping.
 */
object CDefinition : LanguageDefinition {
    override val nodeMetrics: Map<String, Set<Metric>> = CMetricMapping.nodeMetrics
    override val nodeExtractions: Map<String, Extract> = CExtractionMapping.nodeExtractions

    private const val FUNCTION_DECLARATOR = "function_declarator"
    private const val FUNCTION_DEFINITION = "function_definition"

    override val calculationConfig = CalculationConfig(
        ignoreForComplexity = listOf(
            IgnoreRule.TypeWithParentType(FUNCTION_DECLARATOR, FUNCTION_DEFINITION)
        )
    )
}
