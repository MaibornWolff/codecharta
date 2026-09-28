package de.maibornwolff.treesitter.excavationsite.integration.metrics

import de.maibornwolff.treesitter.excavationsite.integration.metrics.adapters.CalculationExtensionsFactory
import de.maibornwolff.treesitter.excavationsite.integration.metrics.adapters.LanguageDefinitionMetricsAdapter
import de.maibornwolff.treesitter.excavationsite.integration.metrics.domain.AvailableFileMetrics
import de.maibornwolff.treesitter.excavationsite.integration.metrics.ports.MetricNodeTypes
import de.maibornwolff.treesitter.excavationsite.shared.domain.LanguageDefinition
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeSitterParser
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeWalker
import org.treesitter.TSLanguage
import org.treesitter.TSTreeCursor
import kotlin.collections.iterator
import kotlin.math.round

/**
 * Collects code metrics by delegating to individual calculators.
 *
 * Uses the restored calculator architecture with MetricsToCalculatorsMap.
 */
class MetricCollector(private val treeSitterLanguage: TSLanguage, private val definition: LanguageDefinition) {
    companion object {
        private const val LONG_METHOD_THRESHOLD = 10
        private const val LONG_PARAMETER_LIST_THRESHOLD = 4
        private const val EXCESSIVE_COMMENTS_THRESHOLD = 10
    }

    private val nodeTypeProvider: MetricNodeTypes = LanguageDefinitionMetricsAdapter(definition)
    private val calculatorsMap = MetricsToCalculatorsMap(
        nodeTypeProvider,
        CalculationExtensionsFactory.fromConfig(definition.calculationConfig)
    )

    private var rootNodeType: String = ""

    /**
     * Parses the given source code and collects metrics.
     *
     * @param content The source code content to analyze
     * @return A map of metric names to their values
     */
    fun collectMetrics(content: String): Map<String, Double> {
        val rootNode = TreeSitterParser.parse(content, treeSitterLanguage)
        rootNodeType = rootNode.type

        val metricValues = mutableMapOf<AvailableFileMetrics, Int>()
        AvailableFileMetrics.entries.forEach { metricValues[it] = 0 }

        val perFileMetricInfo = calculatorsMap.getPerFileMetricInfo()

        TreeWalker.walk(TSTreeCursor(rootNode)) { node, nodeType ->
            if (nodeType == rootNodeType) return@walk

            val startRow = node.startPoint.row
            val endRow = node.endPoint.row

            for ((metric, calculator) in perFileMetricInfo) {
                metricValues[metric] = metricValues.getOrDefault(metric, 0) + calculator(node, nodeType, startRow, endRow)
            }

            calculatorsMap.processPerFunctionMetricsForNode(node, nodeType, startRow, endRow)
        }

        val totalLines = when {
            content.isEmpty() -> 0
            content.endsWith("\n") -> rootNode.endPoint.row
            else -> rootNode.endPoint.row + 1
        }
        return buildMetricsResult(metricValues, totalLines)
    }

    private fun buildMetricsResult(metricValues: Map<AvailableFileMetrics, Int>, totalLines: Int): Map<String, Double> {
        val result = mutableMapOf<String, Double>()

        // File-level metrics
        val logicComplexity = metricValues[AvailableFileMetrics.LOGIC_COMPLEXITY] ?: 0
        val functionComplexity = metricValues[AvailableFileMetrics.COMPLEXITY] ?: 0
        result[AvailableFileMetrics.COMPLEXITY.metricName] = (logicComplexity + functionComplexity).toDouble()
        result[AvailableFileMetrics.LOGIC_COMPLEXITY.metricName] = logicComplexity.toDouble()
        result[AvailableFileMetrics.COMMENT_LINES.metricName] =
            (metricValues[AvailableFileMetrics.COMMENT_LINES] ?: 0).toDouble()
        result[AvailableFileMetrics.NUMBER_OF_FUNCTIONS.metricName] =
            (metricValues[AvailableFileMetrics.NUMBER_OF_FUNCTIONS] ?: 0).toDouble()
        result[AvailableFileMetrics.MESSAGE_CHAINS.metricName] =
            (metricValues[AvailableFileMetrics.MESSAGE_CHAINS] ?: 0).toDouble()
        result[AvailableFileMetrics.REAL_LINES_OF_CODE.metricName] =
            (metricValues[AvailableFileMetrics.REAL_LINES_OF_CODE] ?: 0).toDouble()
        result[AvailableFileMetrics.LINES_OF_CODE.metricName] = totalLines.toDouble()

        // Code smells
        val rlocPerFunction = calculatorsMap.realLinesOfCodeCalc.getMetricPerFunction()
        val parametersPerFunction = calculatorsMap.parametersPerFunctionCalc.getMetricPerFunction()
        val commentLines = metricValues[AvailableFileMetrics.COMMENT_LINES] ?: 0
        val rloc = metricValues[AvailableFileMetrics.REAL_LINES_OF_CODE] ?: 0

        result[AvailableFileMetrics.LONG_METHOD.metricName] = countLongMethods(rlocPerFunction).toDouble()
        result[AvailableFileMetrics.LONG_PARAMETER_LIST.metricName] =
            countLongParameterLists(parametersPerFunction).toDouble()
        result[AvailableFileMetrics.EXCESSIVE_COMMENTS.metricName] = calculateExcessiveComments(commentLines)
        result[AvailableFileMetrics.COMMENT_RATIO.metricName] = calculateCommentRatio(commentLines, rloc)

        // Per-function metrics
        result.putAll(calculatorsMap.getMeasuresOfPerFunctionMetrics())

        return result
    }

    private fun countLongMethods(rlocPerFunction: List<Int>): Int = rlocPerFunction.count { rloc -> rloc > LONG_METHOD_THRESHOLD }

    private fun countLongParameterLists(parametersPerFunction: List<Int>): Int =
        parametersPerFunction.count { params -> params > LONG_PARAMETER_LIST_THRESHOLD }

    private fun calculateExcessiveComments(commentLines: Int): Double = if (commentLines > EXCESSIVE_COMMENTS_THRESHOLD) 1.0 else 0.0

    private fun calculateCommentRatio(commentLines: Int, rloc: Int): Double {
        if (rloc <= 0) return 0.0
        val ratio = commentLines.toDouble() / rloc.toDouble()
        return round(ratio * 100) / 100
    }
}
