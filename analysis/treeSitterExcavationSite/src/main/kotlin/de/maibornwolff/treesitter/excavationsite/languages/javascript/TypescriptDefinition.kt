package de.maibornwolff.treesitter.excavationsite.languages.javascript

import de.maibornwolff.treesitter.excavationsite.shared.domain.Extract
import de.maibornwolff.treesitter.excavationsite.shared.domain.LanguageDefinition
import de.maibornwolff.treesitter.excavationsite.shared.domain.LanguageDependencyMapping
import de.maibornwolff.treesitter.excavationsite.shared.domain.Metric

/**
 * Unified TypeScript language definition combining metrics and extraction.
 *
 * Composes TypescriptMetricMapping and JavascriptExtractionMapping.
 * TypeScript shares extraction configuration with JavaScript as they share the same AST structure.
 */
object TypescriptDefinition : LanguageDefinition {
    override val nodeMetrics: Map<String, Set<Metric>> = TypescriptMetricMapping.nodeMetrics
    override val nodeExtractions: Map<String, Extract> = JavascriptExtractionMapping.nodeExtractions
    override val dependencyMapping: LanguageDependencyMapping = TypescriptDependencyMapping.dependencyMapping
}
