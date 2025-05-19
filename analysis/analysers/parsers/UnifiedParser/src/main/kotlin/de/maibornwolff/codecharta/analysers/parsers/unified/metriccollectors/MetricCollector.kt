package de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors

import de.maibornwolff.codecharta.analysers.parsers.unified.metricqueries.typescript.MetricQueries
import de.maibornwolff.codecharta.model.MutableNode
import de.maibornwolff.codecharta.model.NodeType
import de.maibornwolff.codecharta.model.PathFactory
import de.maibornwolff.codecharta.model.ProjectBuilder
import java.io.File

abstract class MetricCollector<LanguageNode>(
    private val queryProvider: MetricQueries
) {
    abstract fun getMetricFromQuery(node: LanguageNode, query: String): Int
    abstract fun createTreeNodes(code: String): LanguageNode

    fun calculateMetricsForFile(file: File, metricNameToQuery: Map<String, String>): Map<String, Int> {
        val rootNode = createTreeNodes(file.readText())

        val metricNameToValue = mutableMapOf<String, Int>()
        for (metricName in metricNameToQuery.keys) {
            metricNameToValue[metricName] = getMetricFromQuery(rootNode, metricNameToQuery[metricName]!!)
        }
        return metricNameToValue
    }

    fun collectMetricsForFile(file: File, projectBuilder: ProjectBuilder) {
        val rootNode = createTreeNodes(file.readText())

        val metricQueries = queryProvider.getAllQueries()

        val metricNameToValue = mutableMapOf<String, Int>()
        for (metricName in metricQueries.keys) {
            metricNameToValue[metricName] = getMetricFromQuery(rootNode, metricQueries[metricName]!!)
        }

        val node = MutableNode(
            name = file.name,
            type = NodeType.File,
            attributes = metricNameToValue
        )

        val path = PathFactory.fromFileSystemPath(file.toString()).parent
        projectBuilder.insertByPath(path, node)
    }
}
