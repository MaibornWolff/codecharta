package de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors

import de.maibornwolff.codecharta.analysers.parsers.unified.metriccalculators.CalculationExtensions
import de.maibornwolff.codecharta.analysers.parsers.unified.metriccalculators.MetricsToCalculatorsMap
import de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes.AvailableFileMetrics
import de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes.MetricNodeTypes
import de.maibornwolff.codecharta.model.ChecksumCalculator
import de.maibornwolff.codecharta.model.MutableNode
import de.maibornwolff.codecharta.model.NodeType
import org.treesitter.TSLanguage
import org.treesitter.TSNode
import org.treesitter.TSParser
import org.treesitter.TSTreeCursor
import java.io.File
import kotlin.math.round

abstract class MetricCollector(
    private val treeSitterLanguage: TSLanguage,
    protected val nodeTypeProvider: MetricNodeTypes,
    calculationExtensions: CalculationExtensions = CalculationExtensions()
) {
    companion object {
        private const val LONG_METHOD_THRESHOLD = 10
        private const val LONG_PARAMETER_LIST_THRESHOLD = 4
        private const val EXCESSIVE_COMMENTS_THRESHOLD = 10
    }

    private var rootNodeType: String = ""

    private val metricCalculators = MetricsToCalculatorsMap(nodeTypeProvider, calculationExtensions)
    private val metricPerFileInfo = metricCalculators.getPerFileMetricInfo()

    fun collectMetricsForFile(file: File): MutableNode {
        val fileContent = file.readText()
        return collectMetricsForFile(file, fileContent)
    }

    fun collectMetricsForFile(file: File, fileContent: String): MutableNode {
        val checksum = ChecksumCalculator.calculateChecksum(fileContent)
        val rootNode = getRootNode(fileContent)
        rootNodeType = rootNode.type

        // we use an IntArray and not a map here as it improves performance
        val metricValues = IntArray(metricPerFileInfo.size) { 0 }
        walkTree(Pair(TSTreeCursor(rootNode), metricValues))

        val metricNameToValue = mapMetricValuesToNodeAttributes(metricValues)

        // the actual complexity is calculated here from its previous value and logic_complexity to improve performance
        val functionComplexity = metricNameToValue[AvailableFileMetrics.COMPLEXITY.metricName] ?: 0.0
        val logicComplexity = metricNameToValue[AvailableFileMetrics.LOGIC_COMPLEXITY.metricName] ?: 0.0
        metricNameToValue[AvailableFileMetrics.COMPLEXITY.metricName] = logicComplexity + functionComplexity

        // lines of code is added here manually to improve performance as no tree walk is necessary
        metricNameToValue[AvailableFileMetrics.LINES_OF_CODE.metricName] = rootNode.endPoint.row.toDouble()

        countCodeSmells(metricNameToValue)

        metricNameToValue.putAll(metricCalculators.getMeasuresOfPerFunctionMetrics())

        return MutableNode(
            name = file.name,
            type = NodeType.File,
            attributes = metricNameToValue,
            checksum = checksum
        )
    }

    private fun getRootNode(fileContent: String): TSNode {
        val parser = TSParser()
        parser.language = treeSitterLanguage
        val rootNode = parser.parseString(null, fileContent).rootNode
        return rootNode
    }

    private val walkTree = DeepRecursiveFunction<Pair<TSTreeCursor, IntArray>, Unit> { (cursor, metrics) ->
        val currentNode = cursor.currentNode()

        val nodeType = currentNode.type
        val startRow = currentNode.startPoint.row
        val endRow = currentNode.endPoint.row

        val skipRootToAvoidDoubleCountingLines = nodeType != rootNodeType
        if (skipRootToAvoidDoubleCountingLines) {
            for ((metric, calculateMetricForNodeFn) in metricPerFileInfo) {
                metrics[metric.ordinal] += calculateMetricForNodeFn(currentNode, nodeType, startRow, endRow)
            }
        }
        metricCalculators.processPerFunctionMetricsForNode(currentNode, nodeType, startRow, endRow)

        if (cursor.gotoFirstChild()) {
            do {
                callRecursive(Pair(cursor, metrics))
            } while (cursor.gotoNextSibling())
            cursor.gotoParent()
        }
    }

    private fun mapMetricValuesToNodeAttributes(metricValues: IntArray): MutableMap<String, Double> {
        val metricNameToValue = mutableMapOf<String, Double>()

        for ((metric, _) in metricPerFileInfo) {
            metricNameToValue[metric.metricName] = metricValues[metric.ordinal].toDouble()
        }

        return metricNameToValue
    }

    private fun countCodeSmells(metricNameToValue: MutableMap<String, Double>) {
        metricNameToValue[AvailableFileMetrics.LONG_METHOD.metricName] = countLongMethods(metricCalculators).toDouble()
        metricNameToValue[AvailableFileMetrics.LONG_PARAMETER_LIST.metricName] = countLongParameterLists(metricCalculators).toDouble()
        metricNameToValue[AvailableFileMetrics.EXCESSIVE_COMMENTS.metricName] = calculateExcessiveComments(metricNameToValue)
        metricNameToValue[AvailableFileMetrics.COMMENT_RATIO.metricName] = calculateCommentRatio(metricNameToValue)
    }

    private fun countLongMethods(calculators: MetricsToCalculatorsMap): Int {
        val rlocPerFunction = calculators.realLinesOfCodeCalc.getMetricPerFunction()
        return rlocPerFunction.count { rloc -> rloc > LONG_METHOD_THRESHOLD }
    }

    private fun countLongParameterLists(calculators: MetricsToCalculatorsMap): Int {
        val parametersPerFunction = calculators.parametersPerFunctionCalc.getMetricPerFunction()
        return parametersPerFunction.count { parameters -> parameters > LONG_PARAMETER_LIST_THRESHOLD }
    }

    private fun calculateExcessiveComments(metricNameToValue: Map<String, Double>): Double {
        val commentLines = metricNameToValue[AvailableFileMetrics.COMMENT_LINES.metricName] ?: 0.0
        return if (commentLines > EXCESSIVE_COMMENTS_THRESHOLD) 1.0 else 0.0
    }

    private fun calculateCommentRatio(metricNameToValue: Map<String, Double>): Double {
        val commentLines = metricNameToValue[AvailableFileMetrics.COMMENT_LINES.metricName] ?: 0.0
        val rloc = metricNameToValue[AvailableFileMetrics.REAL_LINES_OF_CODE.metricName] ?: 0.0
        val ratio = if (rloc > 0) commentLines / rloc else return 0.0
        return round(ratio * 100) / 100
    }
}
