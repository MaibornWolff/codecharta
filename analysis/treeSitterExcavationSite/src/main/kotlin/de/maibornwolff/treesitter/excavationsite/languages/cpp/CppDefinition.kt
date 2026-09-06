package de.maibornwolff.treesitter.excavationsite.languages.cpp

import de.maibornwolff.treesitter.excavationsite.shared.domain.CalculationConfig
import de.maibornwolff.treesitter.excavationsite.shared.domain.Extract
import de.maibornwolff.treesitter.excavationsite.shared.domain.LanguageDefinition
import de.maibornwolff.treesitter.excavationsite.shared.domain.LanguageDependencyMapping
import de.maibornwolff.treesitter.excavationsite.shared.domain.Metric

/**
 * Unified C++ language definition combining metrics, extraction, and dependencies.
 *
 * Composes CppMetricMapping, CppExtractionMapping, CppDependencyMapping, and CppCalculationConfig.
 */
object CppDefinition : LanguageDefinition {
    override val nodeMetrics: Map<String, Set<Metric>> = CppMetricMapping.nodeMetrics
    override val nodeExtractions: Map<String, Extract> = CppExtractionMapping.nodeExtractions
    override val dependencyMapping: LanguageDependencyMapping = CppDependencyMapping.dependencyMapping
    override val calculationConfig: CalculationConfig = CppCalculationConfig.config
}
