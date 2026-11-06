package de.maibornwolff.treesitter.excavationsite.languages.accesslayout

import de.maibornwolff.treesitter.excavationsite.shared.domain.ComposedSource
import de.maibornwolff.treesitter.excavationsite.shared.domain.Extract
import de.maibornwolff.treesitter.excavationsite.shared.domain.LanguageDefinition
import de.maibornwolff.treesitter.excavationsite.shared.domain.Metric

/** The layout of an Access form or report as `SaveAsText` writes it: no grammar reads it, its code parts are VBA and SQL. */
object AccessLayoutDefinition : LanguageDefinition {
    override val nodeMetrics: Map<String, Set<Metric>> = emptyMap()
    override val nodeExtractions: Map<String, Extract> = emptyMap()
    override val composer: (String) -> ComposedSource = AccessLayoutComposer::compose
}
