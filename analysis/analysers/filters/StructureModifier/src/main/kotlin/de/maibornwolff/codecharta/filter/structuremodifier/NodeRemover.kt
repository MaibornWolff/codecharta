package de.maibornwolff.codecharta.analysers.filters.structuremodifier

import de.maibornwolff.codecharta.model.AttributeDescriptor
import de.maibornwolff.codecharta.model.AttributeType
import de.maibornwolff.codecharta.model.BlacklistItem
import de.maibornwolff.codecharta.model.Edge
import de.maibornwolff.codecharta.model.MutableNode
import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.model.ProjectBuilder
import de.maibornwolff.codecharta.util.Logger

class NodeRemover(
    private val project: Project
) {
    fun remove(paths: Array<String>): Project {
        var pathSegments =
            paths.map {
                it.removePrefix("/").removeSuffix("/").split("/")
            }

        if (pathSegments.contains(listOf("root"))) {
            Logger.warn {
                "Root node cannot be removed"
            }
            pathSegments =
                pathSegments.filter {
                    it != listOf("root")
                }
        }

        return ProjectBuilder(
            removeNodes(pathSegments),
            removeEdges(paths),
            copyAttributeTypes(),
            copyAttributeDescriptors(),
            removeBlacklistItems(paths)
        ).build(cleanAttributeDescriptors = true)
    }

    private fun removeNodes(paths: List<List<String>>): List<MutableNode> {
        val rootNode = project.rootNode.toMutableNode()
        for (path in paths) {
            var currentNode = rootNode
            if (path[0] != "root") {
                Logger.warn {
                    "Path to node has to start with root: ${path.joinToString("/")}"
                }
                continue
            }

            val pathWithoutRoot = path.drop(1)
            for ((index, pathSegment) in pathWithoutRoot.withIndex()) {
                val isLastSegment = pathWithoutRoot.lastIndex == index
                if (isLastSegment) {
                    currentNode.children.removeIf {
                        it.name == pathSegment
                    }
                } else {
                    val childNode: MutableNode? =
                        currentNode.children.find {
                            it.name == pathSegment
                        }
                    if (childNode != null) {
                        currentNode = childNode
                    } else {
                        Logger.warn {
                            "Path to node not found: ${path.joinToString("/")}"
                        }
                        break
                    }
                }
            }
        }

        return listOf(rootNode)
    }

    private fun removeEdges(removePatterns: Array<String>): MutableList<Edge> {
        var edges = project.edges
        removePatterns.forEach { path ->
            edges =
                edges.filter {
                    !it.fromNodeName.contains(path) && !it.toNodeName.contains(path)
                }
        }
        return edges.toMutableList()
    }

    private fun copyAttributeTypes(): MutableMap<String, MutableMap<String, AttributeType>> {
        val mergedAttributeTypes: MutableMap<String, MutableMap<String, AttributeType>> = mutableMapOf()
        project.attributeTypes.forEach {
            mergedAttributeTypes[it.key] = it.value
        }
        return mergedAttributeTypes.toMutableMap()
    }

    private fun copyAttributeDescriptors(): MutableMap<String, AttributeDescriptor> {
        return project.attributeDescriptors.toMutableMap()
    }

    private fun removeBlacklistItems(paths: Array<String>): MutableList<BlacklistItem> {
        var blacklist = project.blacklist
        paths.forEach { path ->
            blacklist =
                blacklist.filter {
                    !it.path.contains(path)
                }
        }
        return blacklist.toMutableList()
    }
}
