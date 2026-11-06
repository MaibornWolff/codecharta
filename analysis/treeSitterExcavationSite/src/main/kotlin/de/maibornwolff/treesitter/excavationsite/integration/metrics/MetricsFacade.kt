package de.maibornwolff.treesitter.excavationsite.integration.metrics

import de.maibornwolff.treesitter.excavationsite.integration.embedded.EmbeddedSourcesFacade
import de.maibornwolff.treesitter.excavationsite.integration.metrics.calculators.MetricPerFunctionCalc
import de.maibornwolff.treesitter.excavationsite.languages.LanguageRegistry
import de.maibornwolff.treesitter.excavationsite.shared.domain.AvailableFileMetrics
import de.maibornwolff.treesitter.excavationsite.shared.domain.AvailableFunctionMetrics
import de.maibornwolff.treesitter.excavationsite.shared.domain.ComposedSource
import de.maibornwolff.treesitter.excavationsite.shared.domain.EmbeddedSource
import de.maibornwolff.treesitter.excavationsite.shared.domain.Language
import de.maibornwolff.treesitter.excavationsite.shared.domain.MetricsResult
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.ffm.FfmSyntaxTree
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
        definition.composer?.let { compose -> return composedMetrics(compose(content)) }
        val grammarLibrary = LanguageRegistry.getGrammarLibrary(language)
        val processedContent = definition.preprocessor?.invoke(content) ?: content
        return FfmSyntaxTree.parse(processedContent, NativeTreeSitter.grammar(grammarLibrary)).use { tree ->
            val metrics = MetricCollector(definition).collectMetrics(tree, processedContent)
            withComplexityOf(EmbeddedSourcesFacade.embeddedSources(tree, processedContent, definition), metrics)
        }
    }

    // A composed file declares no routines: its parts add their decisions and message chains, it counts its lines itself
    private fun composedMetrics(source: ComposedSource): Map<String, Double> {
        val partMetrics = source.codeParts.map { collectMetrics(it.content, it.language) }
        val sumOverParts = { metric: AvailableFileMetrics -> partMetrics.sumOf { it.getValue(metric.metricName) } }
        val logicComplexity = sumOverParts(AvailableFileMetrics.LOGIC_COMPLEXITY)
        val metrics = AvailableFileMetrics.entries
            .filterNot { it in AvailableFileMetrics.NODE_COUNTS }
            .associateTo(mutableMapOf()) { it.metricName to 0.0 }
        metrics[AvailableFileMetrics.COMPLEXITY.metricName] = logicComplexity
        metrics[AvailableFileMetrics.LOGIC_COMPLEXITY.metricName] = logicComplexity
        metrics[AvailableFileMetrics.MESSAGE_CHAINS.metricName] = sumOverParts(AvailableFileMetrics.MESSAGE_CHAINS)
        metrics[AvailableFileMetrics.REAL_LINES_OF_CODE.metricName] = source.codeLines.toDouble()
        metrics[AvailableFileMetrics.LINES_OF_CODE.metricName] = source.lines.toDouble()
        source.counts.forEach { (metric, count) -> metrics[metric.metricName] = count.toDouble() }
        AvailableFunctionMetrics.entries.forEach { metrics.putAll(MetricPerFunctionCalc.measuresOf(it, emptyList())) }
        return metrics
    }

    // An embedded source, such as an inline template, adds its decisions to the file; its lines are the file's already
    private fun withComplexityOf(embeddedSources: List<EmbeddedSource>, metrics: Map<String, Double>): Map<String, Double> {
        if (embeddedSources.isEmpty()) return metrics
        val embeddedMetrics = embeddedSources.map { collectMetrics(it.content, it.language) }
        return metrics +
            COMPLEXITY_METRICS.associateWith { metric -> metrics.getValue(metric) + embeddedMetrics.sumOf { it.getValue(metric) } }
    }
}
