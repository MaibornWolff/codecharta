package de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors

import de.maibornwolff.codecharta.analysers.parsers.unified.metricqueries.AvailableMetrics
import de.maibornwolff.codecharta.analysers.parsers.unified.metricqueries.MetricQueries
import de.maibornwolff.codecharta.model.MutableNode
import de.maibornwolff.codecharta.model.NodeType
import org.treesitter.TSLanguage
import org.treesitter.TSNode
import org.treesitter.TSParser
import org.treesitter.TSQuery
import org.treesitter.TSQueryCursor
import org.treesitter.TSTreeCursor
import java.io.File

abstract class MetricCollector(
    private val treeSitterLanguage: TSLanguage,
    private val queryProvider: MetricQueries
) {
    private val cursor = TSQueryCursor()
    private val parser = TSParser()
    private var lastCountedLine = -1

    private val metricToCalculation by lazy {
        mapOf(
            AvailableMetrics.COMPLEXITY to this::getComplexity,
            AvailableMetrics.COMMENT_LINES to this::getCommentLines,
            AvailableMetrics.LOC to this::getLinesOfCode,
            AvailableMetrics.RLOC to this::getRealLinesOfCode
        )
    }

    init {
        parser.setLanguage(treeSitterLanguage)
    }

    fun collectMetricsForFile(file: File, metricsToCompute: List<AvailableMetrics>): MutableNode {
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
        val tsQuery = TSQuery(treeSitterLanguage, queryProvider.complexityQuery)
        cursor.exec(tsQuery, root)

        var metricHits = 0
        for (hit in cursor.matches) metricHits++
        return metricHits
    }

    open fun getCommentLines(root: TSNode): Int {
        val tsQuery = TSQuery(treeSitterLanguage, queryProvider.commentLinesQuery)
        cursor.exec(tsQuery, root)

        var metricHits = 0
        for (hit in cursor.matches) {
            val matchingTreeNode = hit.captures[0].node
            val commentStartRow = matchingTreeNode.startPoint.row
            val commentEndRow = matchingTreeNode.endPoint.row
            metricHits += commentEndRow - commentStartRow + 1
        }
        return metricHits
    }

    open fun getLinesOfCode(root: TSNode): Int {
        return root.endPoint.row
    }

    open fun getRealLinesOfCode(root: TSNode): Int {
        if (root.childCount == 0) return 0

        val commentTypes = getTypesFromQuery(queryProvider.commentLinesQuery)
        return walkTree(TSTreeCursor(root), commentTypes)
    }

    private fun getTypesFromQuery(query: String): List<String> {
        val matches = Regex("\\((\\w+)\\)").findAll(query)
        return matches.map { it.groupValues[1] }.toList()
    }

    private fun walkTree(cursor: TSTreeCursor, commentTypes: List<String>): Int {
        var realLinesOfCode = 0
        val currentNode = cursor.currentNode()

        if (!commentTypes.contains(currentNode.type)) {
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
                realLinesOfCode += walkTree(cursor, commentTypes)
            }
        }

        if (cursor.gotoNextSibling()) {
            realLinesOfCode += walkTree(cursor, commentTypes)
        } else {
            cursor.gotoParent()
        }

        return realLinesOfCode
    }
}
