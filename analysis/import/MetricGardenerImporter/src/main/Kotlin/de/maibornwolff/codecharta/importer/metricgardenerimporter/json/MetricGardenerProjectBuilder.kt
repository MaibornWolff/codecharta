package de.maibornwolff.codecharta.importer.metricgardenerimporter.json

import de.maibornwolff.codecharta.importer.metricgardenerimporter.model.MetricGardenerNode
import de.maibornwolff.codecharta.importer.metricgardenerimporter.model.MetricGardenerNodes
import de.maibornwolff.codecharta.importer.metricgardenerimporter.model.Metrics
import de.maibornwolff.codecharta.model.MutableNode
import de.maibornwolff.codecharta.model.NodeType
import de.maibornwolff.codecharta.model.Project
import mu.KotlinLogging

class MetricGardenerProjectBuilder(var metricGardenerNodes: MetricGardenerNodes) : de.maibornwolff.codecharta.model.ProjectBuilder() {

    private val logger = KotlinLogging.logger {}

    override fun build(): Project {
        var i = 0
        for (inputNode in metricGardenerNodes.metricGardenerNodes) {
            val node = generateCodeChartaFileNode(inputNode)
            insertByPath(inputNode.getPath(), node)
            i = i.inc()
            logger.info { "$i. Node  von ${metricGardenerNodes.metricGardenerNodes.size} MetricGardenerNodes wurde eingelesen." }
        }
        return super.build()
    }

    //TODO: Methode müsste private sein. Java Reflections funktionieren hier aber nicht
    fun generateCodeChartaFileNode(metricGardenerNode: MetricGardenerNode): MutableNode {
        return MutableNode(extractFileNameFromPath(metricGardenerNode.name), NodeType.File, mapMetricGardenerMetricsToAttributes(metricGardenerNode.metrics), "", setOf())
    }

     private fun extractFileNameFromPath(path: String?): String {
         if (checkNotNull(path).isNotEmpty()) {
             return path.split("\\").reversed().get(0)
         }
         return ""
    }

    private fun mapMetricGardenerMetricsToAttributes(metrics: Metrics?): Map<String, Any> {
        metrics ?.let {
            return mapOf("mcc" to metrics.mcc, "functions" to metrics.functions, "classes" to metrics.classes,
                    "lines_of_code" to metrics.linesOfCode,
                    "comment_lines" to metrics.commentLines, "real_lines_of_code" to metrics.realLinesOfCode)
        }
        return mapOf()
    }
}
