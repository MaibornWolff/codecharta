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

    private val metricToCalculation = mapOf(
        AvailableMetrics.COMPLEXITY to this::getComplexity,
        AvailableMetrics.COMMENT to this::getCommentLines
    )

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

    fun getComplexity(root: TSNode): Int {
        return calculateCountingMetric(root, queryProvider.complexityQuery)
    }

    fun getCommentLines(root: TSNode): Int {
        return calculateCountingMetric(root, queryProvider.commentQuery)
    }

    private fun calculateCountingMetric(root: TSNode, query: String): Int {
        val tsQuery = TSQuery(treeSitterLanguage, query)
        cursor.exec(tsQuery, root)

        var metricHits = 0
        for (hit in cursor.matches) metricHits++
        return metricHits
    }
}
