package de.maibornwolff.codecharta.analysers.filters.structuremodifier

import de.maibornwolff.codecharta.model.BlacklistItem
import de.maibornwolff.codecharta.model.MetricsLens
import de.maibornwolff.codecharta.model.MutableNode
import de.maibornwolff.codecharta.model.Node
import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.model.ProjectBuilder

class MetricRenamer(private val project: Project, private val newName: String = "complexity") {
    fun rename(): Project {
        if (!doesProjectContainMCC(project)) {
            println("INFO: Project has not been altered as no MCC metric was found!")
            return project
        }

        val updatedRoot = renameMCCRecursivelyInNodes(project.rootNode.toMutableNode())

        return ProjectBuilder
            .fromLenses(
                listOf(updatedRoot),
                renameMccInMetricsLens(project.lenses.metrics),
                project.lenses.dependency,
                copyBlacklist()
            ).build()
    }

    private fun renameMCCRecursivelyInNodes(node: MutableNode): MutableNode {
        if (node.attributes.containsKey("mcc")) {
            val updatedAttributes = node.attributes.toMutableMap()

            val mccValue = updatedAttributes.remove("mcc")
                ?: throw NullPointerException(
                    "Input file contains null value for a node attribute! Please ensure the input is a valid cc.json file."
                )
            updatedAttributes[newName] = mccValue

            node.attributes = updatedAttributes
        }

        if (node.children.isEmpty()) {
            return node
        }

        node.children.forEach { child -> renameMCCRecursivelyInNodes(child) }

        return node
    }

    private fun renameMccInMetricsLens(metrics: MetricsLens): MetricsLens = metrics.copy(
        attributeTypes = renamedMcc(metrics.attributeTypes),
        attributeDescriptors = renamedMcc(metrics.attributeDescriptors)
    )

    private fun <T> renamedMcc(map: Map<String, T>): Map<String, T> {
        if (!map.containsKey("mcc")) return map

        val renamed = map.toMutableMap()
        val mccValue = renamed.remove("mcc")
            ?: throw NullPointerException(
                "Input file contains null value for an mcc metric! Please ensure the input is a valid cc.json file."
            )
        renamed[newName] = mccValue
        return renamed
    }

    private fun copyBlacklist(): MutableList<BlacklistItem> = project.blacklist.toMutableList()

    private fun doesProjectContainMCC(project: Project): Boolean = doesMccExistInNodes(project.rootNode) ||
        project.lenses.metrics.attributeTypes.containsKey("mcc") ||
        project.lenses.metrics.attributeDescriptors.containsKey("mcc")

    private fun doesMccExistInNodes(node: Node): Boolean {
        if (node.attributes.containsKey("mcc")) return true

        if (node.children.isEmpty()) return false

        val resultOfChildNodes = node.children.any { doesMccExistInNodes(it) }
        return resultOfChildNodes
    }
}
