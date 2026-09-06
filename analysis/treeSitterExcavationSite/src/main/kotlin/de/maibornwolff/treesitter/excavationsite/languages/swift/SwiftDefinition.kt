package de.maibornwolff.treesitter.excavationsite.languages.swift

import de.maibornwolff.treesitter.excavationsite.shared.domain.Extract
import de.maibornwolff.treesitter.excavationsite.shared.domain.LanguageDefinition
import de.maibornwolff.treesitter.excavationsite.shared.domain.Metric

/**
 * Unified Swift language definition combining metrics and extraction.
 *
 * Composes SwiftMetricMapping and SwiftExtractionMapping.
 */
object SwiftDefinition : LanguageDefinition {
    override val nodeMetrics: Map<String, Set<Metric>> = SwiftMetricMapping.nodeMetrics
    override val nodeExtractions: Map<String, Extract> = SwiftExtractionMapping.nodeExtractions
}
