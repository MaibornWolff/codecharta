package de.maibornwolff.treesitter.excavationsite.integration.metrics

import de.maibornwolff.treesitter.excavationsite.integration.metrics.adapters.CalculationExtensionsFactory
import de.maibornwolff.treesitter.excavationsite.integration.metrics.adapters.LanguageDefinitionMetricsAdapter
import de.maibornwolff.treesitter.excavationsite.integration.metrics.domain.AvailableFileMetrics
import de.maibornwolff.treesitter.excavationsite.integration.metrics.ports.MetricNodeTypes
import de.maibornwolff.treesitter.excavationsite.shared.domain.LanguageDefinition
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.ffm.FfmSyntaxTree
import kotlin.collections.iterator

/**
 * Collects code metrics by delegating to individual calculators.
 *
 * Uses the restored calculator architecture with MetricsToCalculatorsMap.
 */
internal class MetricCollector(private val definition: LanguageDefinition) {
    private val nodeTypeProvider: MetricNodeTypes = LanguageDefinitionMetricsAdapter(definition)
    private val calculatorsMap = MetricsToCalculatorsMap(
        nodeTypeProvider,
        CalculationExtensionsFactory.fromConfig(definition.calculationConfig)
    )

    private var rootNodeType: String = ""

    /**
     * Collects the metrics of the given source code from its syntax tree.
     *
     * @param tree The syntax tree of the content
     * @param content The source code content to analyze
     * @return A map of metric names to their values
     */
    fun collectMetrics(tree: FfmSyntaxTree, content: String): Map<String, Double> {
        rootNodeType = tree.rootNode.type

        val perFileMetricInfo = calculatorsMap.getPerFileMetricInfo()
        val calculators = perFileMetricInfo.values.toTypedArray()
        // One plain counter per calculator: a map of boxed counts allocated an Integer per node and metric
        val sums = IntArray(calculators.size)

        tree.walk { node, nodeType -> visitNode(node, nodeType, calculators, sums) }

        val metricValues = newMetricValues()
        perFileMetricInfo.keys.forEachIndexed { index, metric -> metricValues[metric] = metricValues.getValue(metric) + sums[index] }
        return buildMetricsResult(metricValues, totalLines(content, tree.rootNode.endRow))
    }

    private fun newMetricValues(): MutableMap<AvailableFileMetrics, Int> {
        val metricValues = mutableMapOf<AvailableFileMetrics, Int>()
        AvailableFileMetrics.entries.forEach { metricValues[it] = 0 }
        return metricValues
    }

    private fun visitNode(node: SyntaxNode, nodeType: String, calculators: Array<PerFileCalculator>, sums: IntArray) {
        if (nodeType == rootNodeType) return

        val startRow = node.startRow
        val endRow = node.endRow

        for (index in calculators.indices) {
            sums[index] += calculators[index](node, nodeType, startRow, endRow)
        }

        calculatorsMap.processPerFunctionMetricsForNode(node, nodeType, startRow, endRow)
    }

    private fun totalLines(content: String, rootEndRow: Int): Int = when {
        content.isEmpty() -> 0
        content.endsWith("\n") -> rootEndRow
        else -> rootEndRow + 1
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
        calculatorsMap.countedMetrics.forEach { fileMetric ->
            result[fileMetric.metricName] = ((metricValues[fileMetric] ?: 0) + calculatorsMap.countOfKeyedObjects(fileMetric)).toDouble()
        }

        // Code smells
        val rlocPerFunction = calculatorsMap.realLinesOfCodeCalc.getMetricPerFunction()
        val parametersPerFunction = calculatorsMap.parametersPerFunctionCalc.getMetricPerFunction()
        val commentLines = metricValues[AvailableFileMetrics.COMMENT_LINES] ?: 0
        val rloc = metricValues[AvailableFileMetrics.REAL_LINES_OF_CODE] ?: 0

        result[AvailableFileMetrics.LONG_METHOD.metricName] = CodeSmells.countLongMethods(rlocPerFunction).toDouble()
        result[AvailableFileMetrics.LONG_PARAMETER_LIST.metricName] =
            CodeSmells.countLongParameterLists(parametersPerFunction).toDouble()
        result[AvailableFileMetrics.EXCESSIVE_COMMENTS.metricName] = CodeSmells.excessiveComments(commentLines)
        result[AvailableFileMetrics.COMMENT_RATIO.metricName] = CodeSmells.commentRatio(commentLines, rloc)

        // Per-function metrics
        result.putAll(calculatorsMap.getMeasuresOfPerFunctionMetrics())

        return result
    }
}
