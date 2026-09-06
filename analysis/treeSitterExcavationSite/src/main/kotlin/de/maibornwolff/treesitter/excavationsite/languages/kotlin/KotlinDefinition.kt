package de.maibornwolff.treesitter.excavationsite.languages.kotlin

import de.maibornwolff.treesitter.excavationsite.shared.domain.Extract
import de.maibornwolff.treesitter.excavationsite.shared.domain.LanguageDefinition
import de.maibornwolff.treesitter.excavationsite.shared.domain.LanguageDependencyMapping
import de.maibornwolff.treesitter.excavationsite.shared.domain.Metric

/**
 * Unified Kotlin language definition combining metrics, extraction, and dependencies.
 *
 * Composes KotlinMetricMapping, KotlinExtractionMapping, and KotlinDependencyMapping.
 */
object KotlinDefinition : LanguageDefinition {
    override val nodeMetrics: Map<String, Set<Metric>> = KotlinMetricMapping.nodeMetrics
    override val nodeExtractions: Map<String, Extract> = KotlinExtractionMapping.nodeExtractions
    override val dependencyMapping: LanguageDependencyMapping = KotlinDependencyMapping.dependencyMapping
}
