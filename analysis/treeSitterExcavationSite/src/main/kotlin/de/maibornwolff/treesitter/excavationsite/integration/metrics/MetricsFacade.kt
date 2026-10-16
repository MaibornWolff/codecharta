package de.maibornwolff.treesitter.excavationsite.integration.metrics

import de.maibornwolff.treesitter.excavationsite.integration.embedded.EmbeddedSourcesFacade
import de.maibornwolff.treesitter.excavationsite.languages.LanguageRegistry
import de.maibornwolff.treesitter.excavationsite.shared.domain.AvailableFileMetrics
import de.maibornwolff.treesitter.excavationsite.shared.domain.EmbeddedSource
import de.maibornwolff.treesitter.excavationsite.shared.domain.Language
import de.maibornwolff.treesitter.excavationsite.shared.domain.MetricsResult
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.ffm.NativeTreeSitter

/**
 * Internal entry point for the metrics feature.
 *
 * This object provides the interface for calculating code metrics.
 */
object MetricsFacade {
    private const val PER_FUNCTION_SUFFIX = "_per_function"
    private val COMPLEXITY_METRICS =
        listOf(AvailableFileMetrics.COMPLEXITY.metricName, AvailableFileMetrics.LOGIC_COMPLEXITY.metricName)

    /**
     * Calculates the metrics of the given source code, those of the file apart from those per function.
     *
     * @param content The source code to analyze
     * @param language The language of the content
     */
    fun parse(content: String, language: Language): MetricsResult {
        val metrics = collectMetrics(content, language)
        return MetricsResult(
            metrics = metrics.filterKeys { !it.endsWith(PER_FUNCTION_SUFFIX) },
            perFunctionMetrics = metrics.filterKeys { it.endsWith(PER_FUNCTION_SUFFIX) }
        )
    }

    private fun collectMetrics(content: String, language: Language): Map<String, Double> {
        val definition = LanguageRegistry.getLanguageDefinition(language)
        val grammarLibrary = LanguageRegistry.getGrammarLibrary(language)
        val processedContent = definition.preprocessor?.invoke(content) ?: content
        val collector = MetricCollector(
            grammar = NativeTreeSitter.grammar(grammarLibrary),
            definition = definition
        )
        val metrics = collector.collectMetrics(processedContent)
        return withComplexityOf(EmbeddedSourcesFacade.embeddedSources(content, grammarLibrary, definition), metrics)
    }

    // An embedded source, such as an inline template, adds its decisions to the file; its lines are the file's already
    private fun withComplexityOf(embeddedSources: List<EmbeddedSource>, metrics: Map<String, Double>): Map<String, Double> {
        if (embeddedSources.isEmpty()) return metrics
        val embeddedMetrics = embeddedSources.map { collectMetrics(it.content, it.language) }
        return metrics +
            COMPLEXITY_METRICS.associateWith { metric -> metrics.getValue(metric) + embeddedMetrics.sumOf { it.getValue(metric) } }
    }
}
