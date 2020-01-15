package de.maibornwolff.codecharta.filter.structuremodifier

import de.maibornwolff.codecharta.model.*
import mu.KotlinLogging

class NodeRemover(private val project: Project) {
    private val logger = KotlinLogging.logger {}

    fun remove(paths: Array<String>): Project {
        var pathSegments = paths.map { it.removePrefix("/").removeSuffix("/").split("/") }

        if (pathSegments.contains(listOf("root"))) {
            logger.warn("Root node cannot be removed")
            pathSegments = pathSegments.filter { it != listOf("root") }
        }

        return ProjectBuilder(
                removeNodes(pathSegments),
                removeEdges(paths),
                copyAttributeTypes(),
                removeBlacklistItems(paths)
        ).build()
    }

    private fun filterNodes(path: List<String>, node: MutableNode): MutableNode {
        val filteredChildren = node.children.filter { it.name != path.firstOrNull() || path.size > 1 }
        node.children = filteredChildren.map {
            filterNodes(path.drop(1), it)
        }.toMutableList()
        return node
    }

    private fun removeNodes(paths: List<List<String>>): MutableList<MutableNode> {
        var root = project.rootNode.toMutableNode()
        paths.forEach { root = filterNodes(it.drop(1), root) }
        return mutableListOf(root)
    }

    private fun removeEdges(removePatterns: Array<String>): MutableList<Edge> {
        var edges = project.edges
        removePatterns.forEach { path -> edges = edges.filter { !it.fromNodeName.contains(path) && !it.toNodeName.contains(path) } }
        return edges.toMutableList()
    }

    private fun copyAttributeTypes(): MutableMap<String, MutableList<Map<String, AttributeType>>> {
        val mergedAttributeTypes: MutableMap<String, MutableList<Map<String, AttributeType>>> = mutableMapOf()
        project.attributeTypes.forEach {
            mergedAttributeTypes[it.key] = it.value.toMutableList()
        }
        return mergedAttributeTypes.toMutableMap()
    }

    private fun removeBlacklistItems(paths: Array<String>): MutableList<BlacklistItem> {
        var blacklist = project.blacklist
        paths.forEach { path -> blacklist = blacklist.filter { !it.path.contains(path) } }
        return blacklist.toMutableList()
    }

}