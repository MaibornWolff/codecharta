package de.maibornwolff.treesitter.excavationsite.languages.angular

import de.maibornwolff.treesitter.excavationsite.shared.domain.Extract
import de.maibornwolff.treesitter.excavationsite.shared.domain.LanguageDefinition
import de.maibornwolff.treesitter.excavationsite.shared.domain.LanguageDependencyMapping
import de.maibornwolff.treesitter.excavationsite.shared.domain.Metric

/**
 * Angular template language definition: an HTML file with Angular's template syntax, which also covers plain HTML.
 */
object AngularDefinition : LanguageDefinition {
    override val nodeMetrics: Map<String, Set<Metric>> = AngularMetricMapping.nodeMetrics
    override val nodeExtractions: Map<String, Extract> = AngularExtractionMapping.nodeExtractions
    override val dependencyMapping: LanguageDependencyMapping = AngularDependencyMapping.dependencyMapping
}
