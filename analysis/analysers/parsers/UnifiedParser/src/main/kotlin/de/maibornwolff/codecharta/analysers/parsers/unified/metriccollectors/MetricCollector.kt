package de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors

import de.maibornwolff.codecharta.analysers.parsers.unified.metriccalculators.CalculationExtensions
import de.maibornwolff.codecharta.analysers.parsers.unified.metriccalculators.MetricsToCalculatorsMap
import de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes.AvailableMetrics
import de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes.MetricNodeTypes
import de.maibornwolff.codecharta.model.MutableNode
import de.maibornwolff.codecharta.model.NodeType
import org.treesitter.TSLanguage
import org.treesitter.TSNode
import org.treesitter.TSParser
import org.treesitter.TSTreeCursor
import java.io.File

abstract class MetricCollector(
    private val treeSitterLanguage: TSLanguage,
    protected val nodeTypeProvider: MetricNodeTypes,
    calculationExtensions: CalculationExtensions = CalculationExtensions()
) {
    private var rootNodeType: String = ""

    private val metricInfo = MetricsToCalculatorsMap.getMetricInfo(nodeTypeProvider, calculationExtensions)

    fun collectMetricsForFile(file: File): MutableNode {
        val rootNode = getRootNode(file)
        rootNodeType = rootNode.type

        // we use an IntArray and not a map here as it improves performance
        val metricValues = IntArray(metricInfo.size) { 0 }
        walkTree(Pair(TSTreeCursor(rootNode), metricValues))

        val metricNameToValue = mapMetricValuesToNodeAttributes(metricValues)

        // the actual complexity is calculated here from its previous value and logic_complexity to improve performance
        val functionComplexity = metricNameToValue[AvailableMetrics.COMPLEXITY.metricName] ?: 0
        val logicComplexity = metricNameToValue[AvailableMetrics.LOGIC_COMPLEXITY.metricName] ?: 0
        metricNameToValue[AvailableMetrics.COMPLEXITY.metricName] = logicComplexity + functionComplexity

        // lines of code is added here manually to improve performance as no tree walk is necessary
        metricNameToValue[AvailableMetrics.LINES_OF_CODE.metricName] = rootNode.endPoint.row

        return MutableNode(
            name = file.name,
            type = NodeType.File,
            attributes = metricNameToValue
        )
    }

    private fun getRootNode(file: File): TSNode {
        val parser = TSParser()
        parser.language = treeSitterLanguage
        val rootNode = parser.parseString(null, file.readText()).rootNode
        return rootNode
    }

    private val walkTree = DeepRecursiveFunction<Pair<TSTreeCursor, IntArray>, Unit> { (cursor, metrics) ->
        val currentNode = cursor.currentNode()

        val nodeType = currentNode.type
        val startRow = currentNode.startPoint.row
        val endRow = currentNode.endPoint.row

        val skipRootToAvoidDoubleCountingLines = nodeType != rootNodeType
        if (skipRootToAvoidDoubleCountingLines) {
            for ((metric, calculateMetricForNodeFn) in metricInfo) {
                metrics[metric.ordinal] += calculateMetricForNodeFn(currentNode, nodeType, startRow, endRow)
            }
        }

        if (cursor.gotoFirstChild()) {
            do {
                callRecursive(Pair(cursor, metrics))
            } while (cursor.gotoNextSibling())
            cursor.gotoParent()
        }
    }

    private fun mapMetricValuesToNodeAttributes(metricValues: IntArray): MutableMap<String, Int> {
        val metricNameToValue = mutableMapOf<String, Int>()

        for ((metric, _) in metricInfo) {
            metricNameToValue[metric.metricName] = metricValues[metric.ordinal]
        }

        return metricNameToValue
    }
}
