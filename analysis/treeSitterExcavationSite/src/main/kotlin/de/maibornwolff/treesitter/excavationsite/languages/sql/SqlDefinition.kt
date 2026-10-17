package de.maibornwolff.treesitter.excavationsite.languages.sql

import de.maibornwolff.treesitter.excavationsite.shared.domain.Extract
import de.maibornwolff.treesitter.excavationsite.shared.domain.LanguageDefinition
import de.maibornwolff.treesitter.excavationsite.shared.domain.LanguageDependencyMapping
import de.maibornwolff.treesitter.excavationsite.shared.domain.Metric

/**
 * SQL of all common dialects, parsed with CodeCharta's own island grammar (libs/tree-sitter-sql-island-*.jar).
 */
object SqlDefinition : LanguageDefinition {
    override val nodeMetrics: Map<String, Set<Metric>> = SqlMetricMapping.nodeMetrics
    override val nodeExtractions: Map<String, Extract> = SqlExtractionMapping.nodeExtractions
    override val dependencyMapping: LanguageDependencyMapping = SqlDependencyMapping.dependencyMapping
}
