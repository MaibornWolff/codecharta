package de.maibornwolff.treesitter.excavationsite.languages.go

import de.maibornwolff.treesitter.excavationsite.shared.domain.Extract
import de.maibornwolff.treesitter.excavationsite.shared.domain.LanguageDefinition
import de.maibornwolff.treesitter.excavationsite.shared.domain.LanguageDependencyMapping
import de.maibornwolff.treesitter.excavationsite.shared.domain.Metric

object GoDefinition : LanguageDefinition {
    override val nodeMetrics: Map<String, Set<Metric>> = GoMetricMapping.nodeMetrics
    override val nodeExtractions: Map<String, Extract> = GoExtractionMapping.nodeExtractions
    override val dependencyMapping: LanguageDependencyMapping = GoDependencyMapping.dependencyMapping
}
