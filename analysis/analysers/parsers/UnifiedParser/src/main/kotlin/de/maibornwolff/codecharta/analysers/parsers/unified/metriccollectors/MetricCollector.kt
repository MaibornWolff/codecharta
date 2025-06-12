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
import java.io.File

abstract class MetricCollector(
    private val treeSitterLanguage: TSLanguage,
    private val queryProvider: MetricQueries
) {
    private val cursor = TSQueryCursor()
    private val parser = TSParser()

    private val metricToCalculation by lazy {
        mapOf(
            AvailableMetrics.COMPLEXITY to this::getComplexity,
            AvailableMetrics.COMMENT_LINES to this::getCommentLines,
            AvailableMetrics.LOC to this::getLinesOfCode,
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
        return calculateCountableMetric(root, queryProvider.complexityQuery)
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

    private fun calculateCountableMetric(root: TSNode, query: String): Int {
        val tsQuery = TSQuery(treeSitterLanguage, query)
        cursor.exec(tsQuery, root)

        var metricHits = 0
        for (hit in cursor.matches) metricHits++
        return metricHits
    }
}
