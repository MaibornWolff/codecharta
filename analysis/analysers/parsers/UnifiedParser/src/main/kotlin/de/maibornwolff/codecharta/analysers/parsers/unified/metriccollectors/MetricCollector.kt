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

    // TODO: remove these
    private var complexity = 0
    private var commentLines = 0
    private var rloc = 0

    fun collectMetricsForFile(file: File, metricsToCompute: List<AvailableMetrics>): MutableNode {
        val parser = TSParser()
        parser.setLanguage(treeSitterLanguage)
        val rootNode = parser.parseString(null, file.readText()).rootNode

//        var metricsToCalculate = queryProvider.getAvailableMetrics()

//        if (metricsToCompute.isNotEmpty()) {
//            metricsToCalculate = metricsToCalculate.filter { metricsToCompute.contains(it) }
//        }

        //TODO: solve this without class variables
        complexity = 0
        commentLines = 0
        rloc = 0

        lastCountedCommentLine = -1
        lastCountedCodeLine = -1

        walkTree(TSTreeCursor(rootNode))

        val metricNameToValue = mutableMapOf(
            "complexity" to complexity,
            "comment_lines" to commentLines,
            "loc" to rootNode.endPoint.row,
            "rloc" to rloc
        )

        return MutableNode(
            name = file.name,
            type = NodeType.File,
            attributes = metricNameToValue
        )
    }

    private val walkTree = DeepRecursiveFunction<TSTreeCursor, Unit> { cursor ->
        val currentNode = cursor.currentNode()

        // TODO: here call different functions that either calculate or dont calculate metrics
        complexity += calculateComplexityForNode(currentNode)
        commentLines += calculateCommentLinesForNode(currentNode)
        rloc += calculateRlocForNode(currentNode)

        if (cursor.gotoFirstChild()) {
            callRecursive(cursor)
        }
        if (cursor.gotoNextSibling()) {
            callRecursive(cursor)
        } else {
            cursor.gotoParent()
        }
    }

    private fun calculateComplexityForNode(node: TSNode): Int {
        if (isNodeAllowedType(node, queryProvider.complexityNodeTypes)) return 1

        else if (node.type == "binary_expression") {
            val operatorNode = node.getChildByFieldName("operator") //TODO: anschauen ob das bottleneck ist
            if (isNodeAllowedType(operatorNode, allowedOperatorsForComplexity)) return 1
        }
        return 0
    }

    private fun calculateCommentLinesForNode(node: TSNode): Int {
        if (node.startPoint.row > lastCountedCommentLine && isNodeAllowedType(node, queryProvider.commentLineNodeTypes)) {
            lastCountedCommentLine = node.startPoint.row
            return node.endPoint.row - node.startPoint.row + 1
        }
        return 0
    }

    private fun isNodeAllowedType(currentNode: TSNode, allowedType: Set<String>): Boolean {
        return allowedType.contains(currentNode.type)
    }

    private fun calculateRlocForNode(node: TSNode): Int {
        if (isNodeAllowedType(node, queryProvider.commentLineNodeTypes)) return 0

        var rlocForNode = 0

        if (node.startPoint.row > lastCountedCodeLine) {
            lastCountedCodeLine = node.startPoint.row
            rlocForNode++
        }

        if (isLeafNode(node) && node.endPoint.row > lastCountedCodeLine) {
            lastCountedCodeLine = node.endPoint.row
            rlocForNode += node.endPoint.row - node.startPoint.row
        }

        return rlocForNode
    }

    private fun isLeafNode(node: TSNode): Boolean {
        return node.childCount == 0
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
