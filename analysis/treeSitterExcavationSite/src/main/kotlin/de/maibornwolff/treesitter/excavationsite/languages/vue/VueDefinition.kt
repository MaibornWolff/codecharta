package de.maibornwolff.treesitter.excavationsite.languages.vue

import de.maibornwolff.treesitter.excavationsite.languages.javascript.JavascriptDefinition
import de.maibornwolff.treesitter.excavationsite.shared.domain.CalculationConfig
import de.maibornwolff.treesitter.excavationsite.shared.domain.Extract
import de.maibornwolff.treesitter.excavationsite.shared.domain.LanguageDefinition
import de.maibornwolff.treesitter.excavationsite.shared.domain.Metric

/**
 * Vue Single File Component language definition.
 *
 * Reuses JavaScript's metric and extraction mappings since Vue SFCs
 * contain JavaScript/TypeScript in their <script> sections.
 * The preprocessor extracts the script content before parsing.
 */
object VueDefinition : LanguageDefinition {
    override val nodeMetrics: Map<String, Set<Metric>> = JavascriptDefinition.nodeMetrics
    override val nodeExtractions: Map<String, Extract> = JavascriptDefinition.nodeExtractions
    override val calculationConfig: CalculationConfig = JavascriptDefinition.calculationConfig
    override val preprocessor: ((String) -> String)? = VueScriptExtractor::extractScriptContent
}
