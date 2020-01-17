package de.maibornwolff.codecharta.filter.structuremodifier

import de.maibornwolff.codecharta.model.*
import mu.KotlinLogging

class SubProjectExtractor(private val project: Project) {

    private val logger = KotlinLogging.logger { }
    private lateinit var path: String

    fun extract(path: String): Project {
        this.path = path
        val pathSegments = path.removePrefix("/").split("/").filter { it.isNotEmpty() }
        return ProjectBuilder(
                addRoot(extractNodes(pathSegments, project.rootNode.toMutableNode())),
                extractEdges(path),
                copyAttributeTypes(),
                copyBlacklist()
        ).build()
    }

    private fun extractNodes(extractionPattern: List<String>, node: MutableNode): MutableList<MutableNode> {
        val children: List<MutableNode> = node.children
        val extractedNodes: MutableList<MutableNode> = mutableListOf()

        val currentSearchPattern = extractionPattern.firstOrNull()
        if (currentSearchPattern == node.name) {
            return if (extractionPattern.size == 1) node.children.toMutableList()
            else children.map { child ->
                extractNodes(extractionPattern.drop(1), child)
            }.flatten().toMutableList()
        }

        return extractedNodes
    }

    private fun addRoot(nodes: MutableList<MutableNode>): List<MutableNode> {
        if (nodes.size == 0) logger.warn("No nodes with the specified path ($path) were fond. The resulting project is therefore empty")

        val rootNode = project.rootNode.toMutableNode()
        rootNode.children = nodes
        return mutableListOf(rootNode)
    }

    private fun extractEdges(extractionPattern: String): MutableList<Edge> {
            val trimmedExtractionPattern = "/" + extractionPattern.removeSuffix("/").removePrefix("/")
        return extractRenamedEdgesForPattern(trimmedExtractionPattern).toMutableList()
    }

    private fun extractRenamedEdgesForPattern(pattern: String): List<Edge> {
        return project.edges.filter { it.fromNodeName.startsWith(pattern) && it.toNodeName.startsWith(pattern) }
                .map { edge ->
                    edge.fromNodeName = "/root" + edge.fromNodeName.removePrefix(pattern)
                    edge.toNodeName = "/root" + edge.toNodeName.removePrefix(pattern)
                    edge
                }
    }

    private fun copyAttributeTypes(): MutableMap<String, MutableList<Map<String, AttributeType>>> {
        val mergedAttributeTypes: MutableMap<String, MutableList<Map<String, AttributeType>>> = mutableMapOf()
        project.attributeTypes.forEach {
            mergedAttributeTypes[it.key] = it.value.toMutableList()
        }
        return mergedAttributeTypes.toMutableMap()
    }

    private fun copyBlacklist(): MutableList<BlacklistItem> {
        return project.blacklist.toMutableList()
    }
}