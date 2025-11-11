package de.maibornwolff.codecharta.analysers.tools.metricthresholdchecker.validation

import de.maibornwolff.codecharta.analysers.tools.metricthresholdchecker.model.ThresholdConfiguration
import de.maibornwolff.codecharta.analysers.tools.metricthresholdchecker.model.ThresholdViolation
import de.maibornwolff.codecharta.model.Node
import de.maibornwolff.codecharta.model.NodeType
import de.maibornwolff.codecharta.model.Project

class ThresholdValidator(private val config: ThresholdConfiguration) {
    fun validate(project: Project): List<ThresholdViolation> {
        return validateNode(project.rootNode, "")
    }

    private fun validateNode(node: Node, currentPath: String): List<ThresholdViolation> {
        val nodePath = if (currentPath.isEmpty()) {
            node.name
        } else {
            "$currentPath/${node.name}"
        }

        return when (node.type) {
            NodeType.File -> validateFileMetrics(nodePath, node)
            NodeType.Folder -> {
                node.children.flatMap { child ->
                    validateNode(child, nodePath)
                }
            }
            else -> {
                emptyList()
            }
        }
    }

    private fun validateFileMetrics(path: String, node: Node): List<ThresholdViolation> {
        return config.fileMetrics.mapNotNull { (metricName, threshold) ->
            val attributeValue = node.attributes[metricName]
            if (attributeValue !is Number) return@mapNotNull null
            if (!threshold.isViolated(attributeValue)) return@mapNotNull null

            val violationType = threshold.getViolationType(attributeValue) ?: return@mapNotNull null

            ThresholdViolation(
                path = path,
                metricName = metricName,
                actualValue = attributeValue,
                threshold = threshold,
                violationType = violationType
            )
        }
    }
}
