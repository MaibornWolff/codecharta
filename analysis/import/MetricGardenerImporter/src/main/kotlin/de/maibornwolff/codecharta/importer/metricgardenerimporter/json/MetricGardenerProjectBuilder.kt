package de.maibornwolff.codecharta.importer.metricgardenerimporter.json

import de.maibornwolff.codecharta.importer.metricgardenerimporter.model.MetricGardenerNode
import de.maibornwolff.codecharta.importer.metricgardenerimporter.model.MetricGardenerNodes
import de.maibornwolff.codecharta.model.MutableNode
import de.maibornwolff.codecharta.model.NodeType
import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.model.ProjectBuilder
import mu.KotlinLogging

class MetricGardenerProjectBuilder(var metricGardenerNodes: MetricGardenerNodes) : ProjectBuilder() {

    private val logger = KotlinLogging.logger {}

    override fun build(): Project {
        var i = 0
        for (inputNode in metricGardenerNodes.metricGardenerNodes) {
            val node = generateCodeChartaFileNode(inputNode)
            insertByPath(inputNode.getPathWithoutFileName(), node)
            i = i.inc()
            logger.info { "$i. node of ${metricGardenerNodes.metricGardenerNodes.size} MetricGardenerNodes processed" }
        }
        return super.build()
    }

    fun generateCodeChartaFileNode(metricGardenerNode: MetricGardenerNode): MutableNode {
        return MutableNode(extractFileNameFromPath(metricGardenerNode.name), NodeType.File, metricGardenerNode.metrics, "", setOf())
    }

    private fun extractFileNameFromPath(path: String?): String {
        if (!path.isNullOrBlank()) {
            return path.split("\\").reversed().get(0)
        }
        return ""
    }
}
