package de.maibornwolff.treesitter.excavationsite.integration.metrics

import de.maibornwolff.treesitter.excavationsite.shared.domain.GrammarLibrary
import de.maibornwolff.treesitter.excavationsite.shared.domain.LanguageDefinition
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.ffm.NativeTreeSitter

/**
 * Internal entry point for the metrics feature.
 *
 * This object provides the interface for calculating code metrics.
 */
object MetricsFacade {
    /**
     * Collects metrics for the given source code.
     *
     * @param content The source code to analyze
     * @param grammarLibrary The native grammar library to parse the content with
     * @param definition The language definition containing metric mappings
     * @return A map of metric names to their values
     */
    fun collectMetrics(content: String, grammarLibrary: GrammarLibrary, definition: LanguageDefinition): Map<String, Double> {
        val processedContent = definition.preprocessor?.invoke(content) ?: content
        val collector = MetricCollector(
            grammar = NativeTreeSitter.grammar(grammarLibrary),
            definition = definition
        )
        return collector.collectMetrics(processedContent)
    }
}
