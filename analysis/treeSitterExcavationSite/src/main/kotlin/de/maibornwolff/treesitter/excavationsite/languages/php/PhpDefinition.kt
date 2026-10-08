package de.maibornwolff.treesitter.excavationsite.languages.php

import de.maibornwolff.treesitter.excavationsite.shared.domain.Extract
import de.maibornwolff.treesitter.excavationsite.shared.domain.LanguageDefinition
import de.maibornwolff.treesitter.excavationsite.shared.domain.LanguageDependencyMapping
import de.maibornwolff.treesitter.excavationsite.shared.domain.Metric

object PhpDefinition : LanguageDefinition {
    override val nodeMetrics: Map<String, Set<Metric>> = PhpMetricMapping.nodeMetrics
    override val nodeExtractions: Map<String, Extract> = PhpExtractionMapping.nodeExtractions
    override val dependencyMapping: LanguageDependencyMapping = PhpDependencyMapping.dependencyMapping
}
