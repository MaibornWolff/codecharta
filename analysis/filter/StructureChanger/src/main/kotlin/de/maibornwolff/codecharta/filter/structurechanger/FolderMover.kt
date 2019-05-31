package de.maibornwolff.codecharta.filter.structurechanger

import de.maibornwolff.codecharta.model.*
import mu.KotlinLogging

class FolderMover(private val project: Project) {

    private val logger = KotlinLogging.logger { }
    private var toMove: List<MutableNode>? = null

    fun move(moveFrom: String?, moveTo: String?, projectName: String = project.projectName): Project? {
        if ((moveFrom == null) || (moveTo == null)) {
            logger.error("In order to move nodes, both source and destination need to be set.")
            return null
        }

        return ProjectBuilder(
                projectName,
                moveNodes(moveFrom, moveTo),
                extractEdges(),
                copyAttributeTypes(),
                copyBlacklist()
        ).build()
    }

    private fun getPathSegments(path: String): List<String> {
        return path.removePrefix("/").split("/")
    }

    private fun moveNodes(moveFrom: String, moveTo: String): List<MutableNode> {
        val originPath = getPathSegments(moveFrom)
        val destinationPath = getPathSegments(moveTo)
        val rootNode = project.rootNode.toMutableNode()

        val newStructure = listOf(removeMovedNodeFromStructure(originPath, rootNode)!!)

        return if (toMove == null) {
            logger.warn("Path to move was not found in project. No nodes are therefore moved")
            newStructure
        } else {
            insertInNewStructure(destinationPath.drop(1), rootNode)
            newStructure
        }
    }

    private fun removeMovedNodeFromStructure(originPath: List<String>, node: MutableNode): MutableNode? {

        return if (originPath.isEmpty() || originPath.first() != node.name) {
            node
        } else if (originPath.size == 1) {
            toMove = node.children
            null
        } else {
            node.children = node.children.mapNotNull { child -> removeMovedNodeFromStructure(originPath.drop(1), child) }.toMutableList()
            node
        }
    }

    private fun insertInNewStructure(destinationPath: List<String>, node: MutableNode) {
        if (destinationPath.isEmpty()) {
            node.children.addAll(toMove!!)
        } else {
            var chosenChild: MutableNode? = node.children.filter { destinationPath.first() == it.name }.firstOrNull()

            if (chosenChild == null) {
                node.children.add(MutableNode(destinationPath.first(), type = NodeType.Folder))
                chosenChild = node.children.firstOrNull { destinationPath.first() == it.name }
            }
            insertInNewStructure(destinationPath.drop(1), chosenChild!!)
        }
    }

    private fun extractEdges(): MutableList<Edge> {
        return if (project.edges.size == 0) mutableListOf()
        else {
            logger.warn("${project.edges.size} edges were discarded because the node extractor does not support extracting edges yet")
            mutableListOf()
        }
    }

    private fun copyAttributeTypes(): MutableMap<String, MutableList<Map<String, AttributeType>>> {
        val mergedAttributeTypes: MutableMap<String, MutableList<Map<String, AttributeType>>> = mutableMapOf()
        project.attributeTypes.forEach {
            val key: String = it.key
            if (mergedAttributeTypes.containsKey(key)) {
                it.value.forEach {
                    if (!mergedAttributeTypes[key]!!.contains(it)) {
                        mergedAttributeTypes[key]!!.add(it)
                    }
                }
            } else {
                mergedAttributeTypes[key] = it.value.toMutableList()
            }
        }
        return mergedAttributeTypes
    }

    private fun copyBlacklist(): MutableList<BlacklistItem> {
        return project.blacklist.toMutableList()
    }
}