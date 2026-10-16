package de.maibornwolff.treesitter.excavationsite.languages.angular

import de.maibornwolff.treesitter.excavationsite.languages.angular.extractors.QUOTING_PARENTS
import de.maibornwolff.treesitter.excavationsite.shared.domain.CalculationConfig
import de.maibornwolff.treesitter.excavationsite.shared.domain.Extract
import de.maibornwolff.treesitter.excavationsite.shared.domain.IgnoreRule
import de.maibornwolff.treesitter.excavationsite.shared.domain.LanguageDefinition
import de.maibornwolff.treesitter.excavationsite.shared.domain.LanguageDependencyMapping
import de.maibornwolff.treesitter.excavationsite.shared.domain.Metric

/**
 * Angular template language definition: an HTML file with Angular's template syntax, which also covers plain HTML.
 */
object AngularDefinition : LanguageDefinition {
    private const val COMMENT = "comment"

    override val nodeMetrics: Map<String, Set<Metric>> = AngularMetricMapping.nodeMetrics
    override val nodeExtractions: Map<String, Extract> = AngularExtractionMapping.nodeExtractions
    override val dependencyMapping: LanguageDependencyMapping = AngularDependencyMapping.dependencyMapping
    override val calculationConfig = CalculationConfig(
        ignoreForCommentLines = QUOTING_PARENTS.map { quotingParent -> IgnoreRule.TypeWithParentType(COMMENT, quotingParent) }
    )
}
