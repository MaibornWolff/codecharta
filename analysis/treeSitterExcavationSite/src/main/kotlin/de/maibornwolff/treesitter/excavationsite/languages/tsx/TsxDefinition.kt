package de.maibornwolff.treesitter.excavationsite.languages.tsx

import de.maibornwolff.treesitter.excavationsite.shared.domain.Extract
import de.maibornwolff.treesitter.excavationsite.shared.domain.LanguageDefinition
import de.maibornwolff.treesitter.excavationsite.shared.domain.LanguageDependencyMapping
import de.maibornwolff.treesitter.excavationsite.shared.domain.Metric

object TsxDefinition : LanguageDefinition {
    override val nodeMetrics: Map<String, Set<Metric>> = TsxMetricMapping.nodeMetrics
    override val nodeExtractions: Map<String, Extract> = TsxExtractionMapping.nodeExtractions
    override val dependencyMapping: LanguageDependencyMapping = TsxDependencyMapping.dependencyMapping
}
