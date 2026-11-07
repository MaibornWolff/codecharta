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

    // A composed file adds the decisions and message chains of its parts, it counts its lines and routines itself
    private fun composedMetrics(source: ComposedSource): Map<String, Double> {
        val routineMetrics = source.routines.map { collectMetrics(it.part.content, it.part.language) }
        val partMetrics = source.codeParts.map { collectMetrics(it.content, it.language) } + routineMetrics
        val sumOverParts = { metric: AvailableFileMetrics -> partMetrics.sumOf { it.getValue(metric.metricName) } }
        val logicComplexity = sumOverParts(AvailableFileMetrics.LOGIC_COMPLEXITY)
        val metrics = AvailableFileMetrics.entries
            .filterNot { it in AvailableFileMetrics.NODE_COUNTS }
            .associateTo(mutableMapOf()) { it.metricName to 0.0 }
        metrics[AvailableFileMetrics.COMPLEXITY.metricName] = logicComplexity + source.routines.size
        metrics[AvailableFileMetrics.LOGIC_COMPLEXITY.metricName] = logicComplexity
        metrics[AvailableFileMetrics.MESSAGE_CHAINS.metricName] = sumOverParts(AvailableFileMetrics.MESSAGE_CHAINS)
        metrics[AvailableFileMetrics.REAL_LINES_OF_CODE.metricName] = source.codeLines.toDouble()
        metrics[AvailableFileMetrics.LINES_OF_CODE.metricName] = source.lines.toDouble()
        metrics[AvailableFileMetrics.COMMENT_LINES.metricName] = source.commentLines.toDouble()
        metrics[AvailableFileMetrics.NUMBER_OF_FUNCTIONS.metricName] = source.routines.size.toDouble()
        source.counts.forEach { (metric, count) -> metrics[metric.metricName] = count.toDouble() }
        val complexityPerRoutine = routineMetrics.map { it.getValue(AvailableFileMetrics.LOGIC_COMPLEXITY.metricName).toInt() }
        metrics.putAll(perRoutineMetrics(source, complexityPerRoutine))
        return metrics
    }

    private fun perRoutineMetrics(source: ComposedSource, complexityPerRoutine: List<Int>): Map<String, Double> {
        val rlocPerRoutine = source.routines.map { it.codeLines }
        val valuesPerRoutine = mapOf(
            AvailableFunctionMetrics.PARAMETERS to source.routines.map { 0 },
            AvailableFunctionMetrics.COMPLEXITY to complexityPerRoutine,
            AvailableFunctionMetrics.RLOC to rlocPerRoutine
        )
        return valuesPerRoutine
            .flatMap { (metric, values) -> MetricPerFunctionCalc.measuresOf(metric, values).entries }
            .associate { it.key to it.value } +
            mapOf(
                AvailableFileMetrics.LONG_METHOD.metricName to CodeSmells.countLongMethods(rlocPerRoutine).toDouble(),
                AvailableFileMetrics.EXCESSIVE_COMMENTS.metricName to CodeSmells.excessiveComments(source.commentLines),
                AvailableFileMetrics.COMMENT_RATIO.metricName to CodeSmells.commentRatio(source.commentLines, source.codeLines)
            )
    }

    // An embedded source, such as an inline template, adds its decisions to the file; its lines are the file's already
    private fun withComplexityOf(embeddedSources: List<EmbeddedSource>, metrics: Map<String, Double>): Map<String, Double> {
        if (embeddedSources.isEmpty()) return metrics
        val embeddedMetrics = embeddedSources.map { collectMetrics(it.content, it.language) }
        return metrics +
            COMPLEXITY_METRICS.associateWith { metric -> metrics.getValue(metric) + embeddedMetrics.sumOf { it.getValue(metric) } }
    }
}
