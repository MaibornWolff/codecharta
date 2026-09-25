package de.maibornwolff.treesitter.excavationsite.languages.go

import de.maibornwolff.treesitter.excavationsite.shared.domain.Extract
import de.maibornwolff.treesitter.excavationsite.shared.domain.LanguageDefinition
import de.maibornwolff.treesitter.excavationsite.shared.domain.Metric

/**
 * Unified Go language definition combining metrics and extraction.
 *
 * Composes GoMetricMapping and GoExtractionMapping.
 */
object GoDefinition : LanguageDefinition {
    override val nodeMetrics: Map<String, Set<Metric>> = GoMetricMapping.nodeMetrics
    override val nodeExtractions: Map<String, Extract> = GoExtractionMapping.nodeExtractions
}
