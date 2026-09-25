package de.maibornwolff.treesitter.excavationsite.languages.bash

import de.maibornwolff.treesitter.excavationsite.shared.domain.Extract
import de.maibornwolff.treesitter.excavationsite.shared.domain.LanguageDefinition
import de.maibornwolff.treesitter.excavationsite.shared.domain.Metric

/**
 * Unified Bash language definition combining metrics and extraction.
 *
 * Composes BashMetricMapping and BashExtractionMapping.
 */
object BashDefinition : LanguageDefinition {
    override val nodeMetrics: Map<String, Set<Metric>> = BashMetricMapping.nodeMetrics
    override val nodeExtractions: Map<String, Extract> = BashExtractionMapping.nodeExtractions
}
