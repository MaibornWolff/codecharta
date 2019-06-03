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
                extractEdges(paths),
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

    private fun extractEdges(extractionPatterns: Array<String>): MutableList<Edge> {
        val extractedEdges: MutableList<Edge> = mutableListOf()
        extractionPatterns.forEach { extractionPattern ->
            val trimmedExtractionPattern = "/" + extractionPattern.removeSuffix("/").removePrefix("/")
            extractedEdges.addAll(extractRenamedEdgesForPattern(trimmedExtractionPattern))
        }
        return extractedEdges
    }

    private fun extractRenamedEdgesForPattern(pattern: String): List<Edge> {
        return project.edges.filter { it.fromNodeName.startsWith(pattern) && it.toNodeName.startsWith(pattern) }
                .map { edge ->
                    edge.fromNodeName = edge.fromNodeName.removePrefix(pattern)
                    edge.toNodeName = edge.toNodeName.removePrefix(pattern)
                    edge
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