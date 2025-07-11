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

    // TODO: change this from functions that get the metric for a file to functions that decide if the metric should be incremented for a node
    private val metricToCalculation by lazy {
        mapOf(
//            AvailableMetrics.COMPLEXITY to this::getComplexity,
//            AvailableMetrics.COMMENT_LINES to this::getCommentLines,
//            AvailableMetrics.LOC to this::getLinesOfCode,
//            AvailableMetrics.RLOC to this::getRealLinesOfCode
            AvailableMetrics.COMPLEXITY to this::calculateComplexityForNode,
            AvailableMetrics.COMMENT_LINES to this::calculateCommentLinesForNode,
            AvailableMetrics.RLOC to this::calculateRlocForNode
        )
    }

    //TODO: reqork queries to directly include this
    private val allowedOperatorsForComplexity = queryProvider.complexityNodeTypes
        .filter { it.contains("binary_expression") }
        .map { it.split(" ", "operator:").last() }
        .toSet()

    fun collectMetricsForFile(file: File, metricsToCompute: List<AvailableMetrics>): MutableNode {
        val parser = TSParser()
        parser.setLanguage(treeSitterLanguage)
        val rootNode = parser.parseString(null, file.readText()).rootNode

//        var metricsToCalculate = queryProvider.getAvailableMetrics()

//        if (metricsToCompute.isNotEmpty()) {
//            metricsToCalculate = metricsToCalculate.filter { metricsToCompute.contains(it) }
//        }

        lastCountedCommentLine = -1
        lastCountedCodeLine = -1

        val metrics = intArrayOf(0, 0, 0) // complexity, comment_lines, rloc
        walkTree(Pair(TSTreeCursor(rootNode), metrics))

        val metricNameToValue = mutableMapOf(
            "complexity" to metrics[0],
            "comment_lines" to metrics[1],
            "loc" to rootNode.endPoint.row,
            "rloc" to metrics[2],
//            "nrofNodes" to result[3]
        )

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

        // Calculate and accumulate metrics for current node
        metrics[0] += calculateComplexityForNode(currentNode, nodeType)
        metrics[1] += calculateCommentLinesForNode(nodeType, startRow, endRow)
        metrics[2] += calculateRlocForNode(nodeType, startRow, endRow, currentNode.childCount)

        // Process all children
        if (cursor.gotoFirstChild()) {
            do {
                callRecursive(Pair(cursor, metrics))
            } while (cursor.gotoNextSibling())
            cursor.gotoParent()
        }
    }

    private fun calculateComplexityForNode(node: TSNode, nodeType: String): Int {
        if (isNodeAllowedType(nodeType, queryProvider.complexityNodeTypes)) return 1

        else if (nodeType == "binary_expression") {
            val operatorNode = node.getChildByFieldName("operator") //TODO: anschauen ob das bottleneck ist
            if (isNodeAllowedType(operatorNode.type, allowedOperatorsForComplexity)) return 1
        }
        return 0
    }

    private fun calculateCommentLinesForNode(nodeType: String, startRow: Int, endRow: Int): Int {
        if (startRow > lastCountedCommentLine && isNodeAllowedType(nodeType, queryProvider.commentLineNodeTypes)) {
            lastCountedCommentLine = startRow
            return endRow - startRow + 1
        }
        return 0
    }

    private fun isNodeAllowedType(nodeType: String, allowedType: Set<String>): Boolean {
        return allowedType.contains(nodeType)
    }

    private fun calculateRlocForNode(nodeType: String, startRow: Int, endRow: Int, childCount: Int): Int {
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

    // TODO: remove
    open fun getComplexity(root: TSNode): Int {
        return 0
    }

    // TODO: remove
    open fun getCommentLines(root: TSNode): Int {
        return 0
    }

    // TODO: remove
    open fun getLinesOfCode(root: TSNode): Int {
        return 0
    }

    // TODO: remove
    open fun getRealLinesOfCode(root: TSNode): Int {
        return 0
    }
}
