package de.maibornwolff.codecharta.analysers.filters.structuremodifier

import de.maibornwolff.codecharta.model.AttributeDescriptor
import de.maibornwolff.codecharta.model.AttributeType
import de.maibornwolff.codecharta.model.BlacklistItem
import de.maibornwolff.codecharta.model.Edge
import de.maibornwolff.codecharta.model.MutableNode
import de.maibornwolff.codecharta.model.Node
import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.model.ProjectBuilder

class MetricRenamer(
    private val project: Project,
    private val newName: String = "complexity"
) {
    fun rename(): Project {
        if (!doesProjectContainMCC(project)) {
            println("INFO: Project has not been altered as no MCC metric was found!")
            return project
        }

        val updatedRoot = renameMCCRecursivelyInNodes(project.rootNode.toMutableNode())
        val updatedAttributeTypes = updatedAttributeTypes(project.attributeTypes)
        val updatedAttributesDescriptors = updatedAttributeDescriptors(project.attributeDescriptors)

        return ProjectBuilder(
            listOf(updatedRoot),
            copyEdges(),
            updatedAttributeTypes.toMutableMap(),
            updatedAttributesDescriptors.toMutableMap(),
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

    private fun updatedAttributeTypes(
        attributeTypes: Map<String, MutableMap<String, AttributeType>>
    ): Map<String, MutableMap<String, AttributeType>> {
        val nodeAttributes = attributeTypes["nodes"] ?: return attributeTypes

        if (nodeAttributes.containsKey("mcc")) {
            val mccType = nodeAttributes.remove("mcc")
                ?: throw NullPointerException(
                    "Input file contains null value for an attribute type! Please ensure the input is a valid cc.json file."
                )
            nodeAttributes[newName] = mccType
        }

        return attributeTypes
    }

    private fun updatedAttributeDescriptors(attributeDescriptors: Map<String, AttributeDescriptor>): Map<String, AttributeDescriptor> {
        if (!attributeDescriptors.containsKey("mcc")) return attributeDescriptors

        val updatedAttributeDescriptors = attributeDescriptors.toMutableMap()
        val mccDescriptor = updatedAttributeDescriptors.remove("mcc")
            ?: throw NullPointerException(
                "Input file contains null value for an attribute descriptor! Please ensure the input is a valid cc.json file."
            )

        updatedAttributeDescriptors[newName] = mccDescriptor
        return updatedAttributeDescriptors
    }

    private fun copyEdges(): MutableList<Edge> {
        return project.edges.toMutableList()
    }

    private fun copyBlacklist(): MutableList<BlacklistItem> {
        return project.blacklist.toMutableList()
    }

    private fun doesProjectContainMCC(project: Project): Boolean {
        return doesMccExistInNodes(project.rootNode) ||
            doesMccExistInAttributeTypes(project.attributeTypes) ||
            doesMccExistInAttributeDescriptors(project.attributeDescriptors)
    }

    private fun doesMccExistInNodes(node: Node): Boolean {
        if (node.attributes.containsKey("mcc")) return true

        if (node.children.isEmpty()) return false

        val resultOfChildNodes = node.children.any { doesMccExistInNodes(it) }
        return resultOfChildNodes
    }

    private fun doesMccExistInAttributeTypes(attributeTypes: Map<String, MutableMap<String, AttributeType>>): Boolean {
        val nodeAttributeTypes = attributeTypes["nodes"] ?: return false
        return nodeAttributeTypes.containsKey("mcc")
    }

    private fun doesMccExistInAttributeDescriptors(attributeDescriptors: Map<String, AttributeDescriptor>): Boolean {
        return attributeDescriptors.containsKey("mcc")
    }
}
