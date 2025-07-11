package de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors

import de.maibornwolff.codecharta.analysers.parsers.unified.metricqueries.AvailableMetrics
import de.maibornwolff.codecharta.analysers.parsers.unified.metricqueries.MetricQueries
import de.maibornwolff.codecharta.model.MutableNode
import de.maibornwolff.codecharta.model.NodeType
import org.treesitter.TSLanguage
import org.treesitter.TSNode
import org.treesitter.TSParser
import org.treesitter.TSTreeCursor
import java.io.File

abstract class MetricCollector(
    private val treeSitterLanguage: TSLanguage,
    private val queryProvider: MetricQueries
) {
    private var lastCountedCommentLine = -1
    private var lastCountedCodeLine = -1

    // maps a metric to its index for the more performant IntArray and the function how to calculate the metric
    private val metricInfo = mapOf(
        AvailableMetrics.COMPLEXITY to Pair(0) { node: TSNode, nodeType: String, _: Int, _: Int, _: Int ->
            calculateComplexityForNode(node, nodeType)
        },
        AvailableMetrics.COMMENT_LINES to Pair(1) { _: TSNode, nodeType: String, startRow: Int, endRow: Int, _: Int ->
            calculateCommentLinesForNode(nodeType, startRow, endRow)
        },
        AvailableMetrics.REAL_LINES_OF_CODE to Pair(2) { _: TSNode, nodeType: String, startRow: Int, endRow: Int, childCount: Int ->
            calculateRealLinesOfCodeForNode(nodeType, startRow, endRow, childCount)
        }
    )
    private val allowedOperatorsForComplexity = queryProvider.complexityNodeTypes
        .filter { it.contains("binary_expression") }
        .map { it.split(" ", "operator:").last() }
        .toSet()

    fun collectMetricsForFile(file: File): MutableNode {
        val parser = TSParser()
        parser.setLanguage(treeSitterLanguage)
        val rootNode = parser.parseString(null, file.readText()).rootNode

        lastCountedCommentLine = -1
        lastCountedCodeLine = -1

        // we use an IntArray and not a map here as it improves performance
        val metrics = IntArray(metricInfo.size) { 0 }
        walkTree(Pair(TSTreeCursor(rootNode), metrics))

        val metricNameToValue = mutableMapOf<String, Int>()
        for ((metric, indexAndCalculator) in metricInfo) {
            val (index, _) = indexAndCalculator
            metricNameToValue[metric.metricName] = metrics[index]
        }

        // lines of code is added here manually to improve performance as no tree walk is necessary
        metricNameToValue[AvailableMetrics.LINES_OF_CODE.metricName] = rootNode.endPoint.row

        return MutableNode(
            name = file.name,
            type = NodeType.File,
            attributes = metricNameToValue
        )
    }

    private val walkTree = DeepRecursiveFunction<Pair<TSTreeCursor, IntArray>, Unit> { (cursor, metrics) ->
        val currentNode = cursor.currentNode()

        val nodeType = currentNode.type
        val startRow = currentNode.startPoint.row
        val endRow = currentNode.endPoint.row
        val childCount = currentNode.childCount

        for ((_, indexAndCalculator) in metricInfo) {
            val (index, calculator) = indexAndCalculator
            metrics[index] += calculator(currentNode, nodeType, startRow, endRow, childCount)
        }

        if (cursor.gotoFirstChild()) {
            do {
                callRecursive(Pair(cursor, metrics))
            } while (cursor.gotoNextSibling())
            cursor.gotoParent()
        }
    }

    protected open fun calculateComplexityForNode(node: TSNode, nodeType: String): Int {
        if (isNodeAllowedType(nodeType, queryProvider.complexityNodeTypes)) {
            return 1
        }
        else if (nodeType == "binary_expression") {
            val operatorNode = node.getChildByFieldName("operator")
            if (isNodeAllowedType(operatorNode.type, allowedOperatorsForComplexity)) return 1
        }
        return 0
    }

    protected open fun calculateCommentLinesForNode(nodeType: String, startRow: Int, endRow: Int): Int {
        if (startRow > lastCountedCommentLine && isNodeAllowedType(nodeType, queryProvider.commentLineNodeTypes)) {
            lastCountedCommentLine = startRow
            return endRow - startRow + 1
        }
        return 0
    }

    private fun isNodeAllowedType(nodeType: String, allowedType: Set<String>): Boolean {
        return allowedType.contains(nodeType)
    }

    protected open fun calculateRealLinesOfCodeForNode(nodeType: String, startRow: Int, endRow: Int, childCount: Int): Int {
        if (isNodeAllowedType(nodeType, queryProvider.commentLineNodeTypes)) return 0

        var rlocForNode = 0

        if (startRow > lastCountedCodeLine) {
            lastCountedCodeLine = startRow
            rlocForNode++
        }

        if (childCount == 0 && endRow > lastCountedCodeLine) {
            lastCountedCodeLine = endRow
            rlocForNode += endRow - startRow
        }

        return rlocForNode
    }
}
