package de.maibornwolff.codecharta.analysers.tools.metricthresholdchecker.validation

import de.maibornwolff.codecharta.analysers.tools.metricthresholdchecker.model.ThresholdConfiguration
import de.maibornwolff.codecharta.analysers.tools.metricthresholdchecker.model.ThresholdViolation
import de.maibornwolff.codecharta.model.Node
import de.maibornwolff.codecharta.model.NodeType
import de.maibornwolff.codecharta.model.Project

class ThresholdValidator(private val config: ThresholdConfiguration) {
    fun validate(project: Project): List<ThresholdViolation> {
        val violations = mutableListOf<ThresholdViolation>()
        validateNode(project.rootNode, "", violations)
        return violations
    }

    private fun validateNode(node: Node, currentPath: String, violations: MutableList<ThresholdViolation>) {
        val nodePath = if (currentPath.isEmpty()) {
            node.name
        } else {
            "$currentPath/${node.name}"
        }

        when (node.type) {
            NodeType.File -> validateFileMetrics(nodePath, node, violations)
            NodeType.Folder -> {
                node.children.forEach { child ->
                    validateNode(child, nodePath, violations)
                }
            }
            else -> {
                // Skip Package, Class, Interface, Method, Unknown, and null node types
            }
        }
    }

    private fun validateFileMetrics(path: String, node: Node, violations: MutableList<ThresholdViolation>) {
        for ((metricName, threshold) in config.fileMetrics) {
            val attributeValue = node.attributes[metricName]
            if (attributeValue !is Number) continue
            if (!threshold.isViolated(attributeValue)) continue

            val violationType = threshold.getViolationType(attributeValue) ?: continue

            violations.add(
                ThresholdViolation(
                    path = path,
                    metricName = metricName,
                    actualValue = attributeValue,
                    threshold = threshold,
                    violationType = violationType
                )
            )
        }
    }
}
