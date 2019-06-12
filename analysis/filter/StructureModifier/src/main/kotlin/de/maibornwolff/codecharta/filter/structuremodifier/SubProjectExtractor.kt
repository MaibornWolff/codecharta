package de.maibornwolff.codecharta.filter.structuremodifier

import de.maibornwolff.codecharta.model.*
import mu.KotlinLogging

class SubProjectExtractor(private val project: Project) {

    val logger = KotlinLogging.logger { }

    fun extract(path: String, projectName: String?): Project {
        val pathSegments = path.removePrefix("/").split("/")
        return ProjectBuilder(
                projectName ?: project.projectName,
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
        if (currentSearchPattern == node.name && extractionPattern.size == 1) return node.children.toMutableList()
        else if (currentSearchPattern == node.name) {
            return children.map { child ->
                extractNodes(extractionPattern.drop(1), child)
            }.flatten().toMutableList()
        }

        return extractedNodes
    }

    private fun addRoot(nodes: MutableList<MutableNode>): List<MutableNode> {
        if (nodes.size == 0) logger.warn("No nodes with the specified path(s) were fond. The resulting project is therefore empty")

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