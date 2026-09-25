package de.maibornwolff.treesitter.excavationsite.languages.ruby

import de.maibornwolff.treesitter.excavationsite.shared.domain.CalculationConfig
import de.maibornwolff.treesitter.excavationsite.shared.domain.Extract
import de.maibornwolff.treesitter.excavationsite.shared.domain.IgnoreRule
import de.maibornwolff.treesitter.excavationsite.shared.domain.LanguageDefinition
import de.maibornwolff.treesitter.excavationsite.shared.domain.Metric

/**
 * Unified Ruby language definition combining metrics and extraction.
 *
 * Composes RubyMetricMapping and RubyExtractionMapping.
 */
object RubyDefinition : LanguageDefinition {
    override val nodeMetrics: Map<String, Set<Metric>> = RubyMetricMapping.nodeMetrics
    override val nodeExtractions: Map<String, Extract> = RubyExtractionMapping.nodeExtractions

    // ========== Calculation Configuration ==========

    private const val IDENTIFIER = "identifier"
    private const val METHOD = "method"
    private val nestedControlStructures = setOf("if", "elsif", "for", "until", "while", "when", "else", "rescue")

    override val calculationConfig = CalculationConfig(
        hasFunctionBodyStartOrEndNode = false,
        ignoreForComplexity = listOf(
            IgnoreRule.TypeEqualsParentTypeWhenInSet(nestedControlStructures),
            IgnoreRule.TypeWhenParentTypeIsNot("else", "case")
        ),
        ignoreForRloc = listOf(
            IgnoreRule.TypeInSet(setOf("then"))
        ),
        ignoreForParameters = listOf(
            IgnoreRule.TypeWithParentType(IDENTIFIER, METHOD)
        )
    )
}
