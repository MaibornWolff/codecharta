package de.maibornwolff.codecharta.filter.structurechanger

import de.maibornwolff.codecharta.model.*
import mu.KotlinLogging

class SubProjectExtractor(private val project: Project) {

    val logger = KotlinLogging.logger { }

    fun extract(paths: Array<String>, projectName: String?): Project {
        val pathSegments = paths.map { it.removePrefix("/").split("/") }
        return ProjectBuilder(
                projectName ?: project.projectName,
                addRoot(extractNodes(pathSegments, project.rootNode.toMutableNode())),
                extractEdges(),
                copyAttributeTypes(),
                copyBlacklist()
        ).build()
    }

    private fun extractNodes(extractionPattern: List<List<String>>, node: MutableNode): MutableList<MutableNode> {
        val children: List<MutableNode> = node.children
        val extractedNodes: MutableList<MutableNode> = mutableListOf()

        extractionPattern.forEach {
            val currentSearchPattern = it.firstOrNull()
            if (currentSearchPattern == node.name && it.size == 1) extractedNodes.add(node)
            else if (currentSearchPattern == node.name) {
                children.forEach { child ->
                    extractedNodes.addAll(extractNodes(listOf(it.drop(1)), child))
                }
            }
        }

        return extractedNodes
    }

    private fun addRoot(nodes: MutableList<MutableNode>): List<MutableNode> {
        if (nodes.size == 0) logger.warn("No nodes with the specified path(s) were fond. The resulting project is therefore empty")

        val rootNode = project.rootNode.toMutableNode()
        rootNode.children = nodes
        return mutableListOf(rootNode)
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