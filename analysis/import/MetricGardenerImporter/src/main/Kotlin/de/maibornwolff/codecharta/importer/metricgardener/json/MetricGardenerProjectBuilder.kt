package de.maibornwolff.codecharta.importer.metricgardener.json

import de.maibornwolff.codecharta.importer.metricgardener.model.MetricGardenerNode
import de.maibornwolff.codecharta.importer.metricgardener.model.MetricGardenerNodes
import de.maibornwolff.codecharta.model.MutableNode
import de.maibornwolff.codecharta.model.NodeType
import de.maibornwolff.codecharta.model.Project
import mu.KotlinLogging

class MetricGardenerProjectBuilder(var metricGardenerNodes: MetricGardenerNodes) :
    de.maibornwolff.codecharta.model.ProjectBuilder() {

    private val logger = KotlinLogging.logger {}

    override fun build(): Project {
        var i = 0
        for (inputNode in metricGardenerNodes.metricGardenerNodes) {
            val node = generateCodeChartaFileNode(inputNode)
            insertByPath(inputNode.getPathWithoutFileName(), node)
            i = i.inc()
            logger.info { "$i. Node  von ${metricGardenerNodes.metricGardenerNodes.size} MetricGardenerNodes wurde eingelesen." }
        }
        return super.build()
    }

    fun generateCodeChartaFileNode(metricGardenerNode: MetricGardenerNode): MutableNode {
        return MutableNode(extractFileNameFromPath(metricGardenerNode.name), NodeType.File, metricGardenerNode.metrics, "", setOf())
    }

    private fun extractFileNameFromPath(path: String?): String {
        if (checkNotNull(path).isNotEmpty()) {
            return path.split("\\").reversed().get(0)
        }
        return ""
    }
}
