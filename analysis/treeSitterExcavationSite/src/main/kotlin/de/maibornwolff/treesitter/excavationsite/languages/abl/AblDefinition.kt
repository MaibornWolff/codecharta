package de.maibornwolff.treesitter.excavationsite.languages.abl

import de.maibornwolff.treesitter.excavationsite.shared.domain.CalculationConfig
import de.maibornwolff.treesitter.excavationsite.shared.domain.Extract
import de.maibornwolff.treesitter.excavationsite.shared.domain.LanguageDefinition
import de.maibornwolff.treesitter.excavationsite.shared.domain.Metric

/**
 * Unified ABL (OpenEdge ABL/Progress 4GL) language definition combining metrics and extraction.
 *
 * Composes AblMetricMapping and AblExtractionMapping.
 *
 * Known limitations:
 * - Per-function complexity: ABL procedures/functions don't have separate "body" nodes in the AST.
 *   Content is directly under the definition node, so per-function complexity tracking may not
 *   work correctly for all patterns. File-level complexity is accurate.
 * - CASE expressions: Inline CASE used as function arguments (e.g., `func(CASE x WHEN...)`) may
 *   not parse correctly due to tree-sitter-abl grammar limitations. Statement-form CASE works.
 */
object AblDefinition : LanguageDefinition {
    override val nodeMetrics: Map<String, Set<Metric>> = AblMetricMapping.nodeMetrics
    override val nodeExtractions: Map<String, Extract> = AblExtractionMapping.nodeExtractions

    override val calculationConfig = CalculationConfig(
        hasFunctionBodyStartOrEndNode = false
    )
}
