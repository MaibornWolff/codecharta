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
    private var lastCountedLine = -1

    private val metricToCalculation by lazy {
        mapOf(
            AvailableMetrics.COMPLEXITY to this::getComplexity,
            AvailableMetrics.COMMENT_LINES to this::getCommentLines,
            AvailableMetrics.LOC to this::getLinesOfCode,
            AvailableMetrics.RLOC to this::getRealLinesOfCode
        )
    }

    fun collectMetricsForFile(file: File, metricsToCompute: List<AvailableMetrics>): MutableNode {
        val parser = TSParser()
        parser.setLanguage(treeSitterLanguage)
        val rootNode = parser.parseString(null, file.readText()).rootNode

        var metricsToCalculate = queryProvider.getAvailableMetrics()

        if (metricsToCompute.isNotEmpty()) {
            metricsToCalculate = metricsToCalculate.filter { metricsToCompute.contains(it) }
        }

        val metricNameToValue = mutableMapOf<String, Int>()
        for ((metric, function) in metricToCalculation) {
            if (!metricsToCalculate.contains(metric)) continue

            metricNameToValue[metric.name.lowercase()] = function(rootNode)
        }

        return MutableNode(
            name = file.name,
            type = NodeType.File,
            attributes = metricNameToValue
        )
    }

    open fun getComplexity(root: TSNode): Int {
        return walkForComplexity(TSTreeCursor(root))
    }

    private val walkForComplexity = DeepRecursiveFunction<TSTreeCursor, Int> { cursor ->
        var complexity = 0
        val currentNode = cursor.currentNode()
        if (isComplexityNode(currentNode, queryProvider.complexityNodeTypes)) complexity++

        if (cursor.gotoFirstChild()) complexity += callRecursive(cursor)
        if (cursor.gotoNextSibling()) complexity += callRecursive(cursor)
        else cursor.gotoParent()

        complexity
    }

    private fun isComplexityNode(currentNode: TSNode, allowedType: Set<String>): Boolean {
        if (allowedType.contains(currentNode.type)) return true

        if (currentNode.type == "binary_expression") {
            val allowedOperators = allowedType
                .filter { it.contains("binary_expression") }
                .map { it.split(" ", "operator:").last() }
            val operatorNode = currentNode.getChildByFieldName("operator")
            if (allowedOperators.contains(operatorNode.type)) return true
        }
        return false
    }

    open fun getCommentLines(root: TSNode): Int {
        val linesWithComments = walkForCommentLines(TSTreeCursor(root))
        return linesWithComments.count()
    }

    private val walkForCommentLines = DeepRecursiveFunction<TSTreeCursor, Set<Int>> { cursor ->
        val linesWithComments = mutableSetOf<Int>()
        val currentNode = cursor.currentNode()
        if (isCommentNode(currentNode, queryProvider.commentLineNodeTypes)) {
            for (i in currentNode.startPoint.row .. currentNode.endPoint.row) {
                linesWithComments.add(i)
            }
        }

        if (cursor.gotoFirstChild()) linesWithComments += callRecursive(cursor)
        if (cursor.gotoNextSibling()) linesWithComments += callRecursive(cursor)
        else cursor.gotoParent()

        linesWithComments
    }

    private fun isCommentNode(currentNode: TSNode, allowedType: Set<String>): Boolean {
        return (allowedType.contains(currentNode.type))
    }

    open fun getLinesOfCode(root: TSNode): Int {
        return root.endPoint.row
    }

    open fun getRealLinesOfCode(root: TSNode): Int {
        if (root.childCount == 0) return 0
        return walkTree(TSTreeCursor(root))
    }

    private val walkTree = DeepRecursiveFunction<TSTreeCursor, Int> { cursor ->
        var realLinesOfCode = 0
        val currentNode = cursor.currentNode()

        if (!queryProvider.commentLineNodeTypes.contains(currentNode.type)) {
            if (currentNode.startPoint.row > lastCountedLine) {
                lastCountedLine = currentNode.startPoint.row
                realLinesOfCode++
            }

            if (currentNode.childCount == 0) {
                if (currentNode.endPoint.row > lastCountedLine) {
                    realLinesOfCode += currentNode.endPoint.row - currentNode.startPoint.row
                    lastCountedLine = currentNode.endPoint.row
                }
            } else if (currentNode.endPoint.row > currentNode.startPoint.row && cursor.gotoFirstChild()) {
                realLinesOfCode += callRecursive(cursor)
            }
        }

        if (cursor.gotoNextSibling()) {
            realLinesOfCode += callRecursive(cursor)
        } else {
            cursor.gotoParent()
        }

        realLinesOfCode
    }
}
