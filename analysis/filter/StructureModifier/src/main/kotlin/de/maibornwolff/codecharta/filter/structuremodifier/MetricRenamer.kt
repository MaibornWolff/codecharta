package de.maibornwolff.codecharta.filter.structuremodifier

import de.maibornwolff.codecharta.model.AttributeDescriptor
import de.maibornwolff.codecharta.model.AttributeType
import de.maibornwolff.codecharta.model.BlacklistItem
import de.maibornwolff.codecharta.model.Edge
import de.maibornwolff.codecharta.model.MutableNode
import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.model.ProjectBuilder

class MetricRenamer(
    private val project: Project
    //TODO: add newName as val here
) {
    fun rename(): Project {
        val updatedRoot = renameMCCRecursivelyInNodes(project.rootNode.toMutableNode())
        val updatedAttributeTypes = updatedAttributeTypes(project.attributeTypes)
        val updatedAttributesDescriptors = updatedAttributeDescriptors(project.attributeDescriptors)

        return ProjectBuilder(
            listOf(updatedRoot),
            copyEdges(),
            updatedAttributeTypes.toMutableMap(),
            updatedAttributesDescriptors.toMutableMap(),
            copyBlacklist(),
        ).build()
    }

    private fun renameMCCRecursivelyInNodes(node: MutableNode): MutableNode {
        if (node.attributes.containsKey("mcc")) {
            val updatedAttributes = node.attributes.toMutableMap()

            val mccValue = updatedAttributes.remove("mcc")
            if (mccValue == null) {
                throw NullPointerException("Input file contains null value for a node attribute! Please ensure the input is a valid cc.json file.")
            }
            updatedAttributes["complexity"] = mccValue

            node.attributes = updatedAttributes
        }

        if (node.children.isEmpty()) {
            return node
        }

        node.children.forEach { child -> renameMCCRecursivelyInNodes(child) }

        return node
    }

    private fun updatedAttributeTypes(attributeTypes: Map<String, MutableMap<String, AttributeType>>): Map<String, MutableMap<String, AttributeType>> {
        val nodeAttributes = attributeTypes["nodes"] ?: return attributeTypes

        val mccType = nodeAttributes.remove("mcc")
        if (mccType == null) {
            throw NullPointerException("Input file contains null value for an attribute type! Please ensure the input is a valid cc.json file.")
        }
        nodeAttributes["complexity"] = mccType

        return attributeTypes
    }

    private fun updatedAttributeDescriptors(attributeDescriptors: Map<String, AttributeDescriptor>): Map<String, AttributeDescriptor> {
        if (!attributeDescriptors.containsKey("mcc")) return attributeDescriptors

        val updatedAttributeDescriptors = attributeDescriptors.toMutableMap()
        val mccDescriptor = updatedAttributeDescriptors.remove("mcc")

        if (mccDescriptor == null) {

            throw NullPointerException("Input file contains null value for an attribute descriptor! Please ensure the input is a valid cc.json file.")
        }
        updatedAttributeDescriptors["complexity"] = mccDescriptor
        return updatedAttributeDescriptors
    }

    private fun copyEdges(): MutableList<Edge> {
        return project.edges.toMutableList()
    }

    private fun copyBlacklist(): MutableList<BlacklistItem> {
        return project.blacklist.toMutableList()
    }
}
