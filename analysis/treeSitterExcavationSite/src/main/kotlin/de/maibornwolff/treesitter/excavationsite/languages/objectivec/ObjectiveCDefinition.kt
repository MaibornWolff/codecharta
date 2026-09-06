package de.maibornwolff.treesitter.excavationsite.languages.objectivec

import de.maibornwolff.treesitter.excavationsite.shared.domain.Extract
import de.maibornwolff.treesitter.excavationsite.shared.domain.LanguageDefinition
import de.maibornwolff.treesitter.excavationsite.shared.domain.Metric

/**
 * Unified Objective-C language definition combining metrics and extraction.
 *
 * Composes ObjectiveCMetricMapping and ObjectiveCExtractionMapping.
 */
object ObjectiveCDefinition : LanguageDefinition {
    override val nodeMetrics: Map<String, Set<Metric>> = ObjectiveCMetricMapping.nodeMetrics
    override val nodeExtractions: Map<String, Extract> = ObjectiveCExtractionMapping.nodeExtractions
}
