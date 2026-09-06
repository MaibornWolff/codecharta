package de.maibornwolff.treesitter.excavationsite.integration.metrics

import de.maibornwolff.treesitter.excavationsite.shared.domain.LanguageDefinition
import org.treesitter.TSLanguage

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
     * @param treeSitterLanguage The TreeSitter language parser
     * @param definition The language definition containing metric mappings
     * @return A map of metric names to their values
     */
    fun collectMetrics(content: String, treeSitterLanguage: TSLanguage, definition: LanguageDefinition): Map<String, Double> {
        val processedContent = definition.preprocessor?.invoke(content) ?: content
        val collector = MetricCollector(
            treeSitterLanguage = treeSitterLanguage,
            definition = definition
        )
        return collector.collectMetrics(processedContent)
    }
}
