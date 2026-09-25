package de.maibornwolff.treesitter.excavationsite.languages.csharp

import de.maibornwolff.treesitter.excavationsite.shared.domain.Extract
import de.maibornwolff.treesitter.excavationsite.shared.domain.LanguageDefinition
import de.maibornwolff.treesitter.excavationsite.shared.domain.LanguageDependencyMapping
import de.maibornwolff.treesitter.excavationsite.shared.domain.Metric

/**
 * Unified C# language definition combining metrics, extraction, and dependencies.
 *
 * Composes CSharpMetricMapping, CSharpExtractionMapping, and CSharpDependencyMapping.
 */
object CSharpDefinition : LanguageDefinition {
    override val nodeMetrics: Map<String, Set<Metric>> = CSharpMetricMapping.nodeMetrics
    override val nodeExtractions: Map<String, Extract> = CSharpExtractionMapping.nodeExtractions
    override val dependencyMapping: LanguageDependencyMapping = CSharpDependencyMapping.dependencyMapping
}
