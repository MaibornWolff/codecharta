package de.maibornwolff.treesitter.excavationsite.languages.accessmacro

import de.maibornwolff.treesitter.excavationsite.shared.domain.ComposedSource
import de.maibornwolff.treesitter.excavationsite.shared.domain.Extract
import de.maibornwolff.treesitter.excavationsite.shared.domain.LanguageDefinition
import de.maibornwolff.treesitter.excavationsite.shared.domain.Metric

/** A stand-alone Access macro as `SaveAsText` writes it: no grammar reads it, its expressions are VBA. */
object AccessMacroDefinition : LanguageDefinition {
    override val nodeMetrics: Map<String, Set<Metric>> = emptyMap()
    override val nodeExtractions: Map<String, Extract> = emptyMap()
    override val composer: (String) -> ComposedSource = AccessMacroComposer::compose
}
