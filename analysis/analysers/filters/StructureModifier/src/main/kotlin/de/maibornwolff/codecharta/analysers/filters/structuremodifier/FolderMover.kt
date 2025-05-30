package de.maibornwolff.codecharta.analysers.filters.structuremodifier

import de.maibornwolff.codecharta.model.AttributeDescriptor
import de.maibornwolff.codecharta.model.AttributeType
import de.maibornwolff.codecharta.model.BlacklistItem
import de.maibornwolff.codecharta.model.Edge
import de.maibornwolff.codecharta.model.MutableNode
import de.maibornwolff.codecharta.model.NodeType
import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.model.ProjectBuilder
import de.maibornwolff.codecharta.util.Logger

class FolderMover(
    private val project: Project
) {
    private var toMove: List<MutableNode>? = null

    fun move(moveFrom: String?, moveTo: String?): Project? {
        if ((moveFrom.isNullOrEmpty()) || (moveTo.isNullOrEmpty())) {
            Logger.error {
                "In order to move nodes, both source and destination need to be set."
            }
            return null
        }

        return ProjectBuilder(
            moveNodes(moveFrom, moveTo),
            extractEdges(moveFrom, moveTo),
            copyAttributeTypes(),
            copyAttributeDescriptors(),
            copyBlacklist(moveFrom, moveTo)
        ).build()
    }

    private fun getPathSegments(path: String): List<String> {
        return path.removePrefix("/").split("/").filter {
            it.isNotEmpty()
        }
    }

    private fun moveNodes(moveFrom: String, moveTo: String): List<MutableNode> {
        val originPath = getPathSegments(moveFrom)
        val destinationPath = getPathSegments(moveTo)
        val rootNode = project.rootNode.toMutableNode()

        val newStructure =
            removeMovedNodeFromStructure(originPath, rootNode) ?: MutableNode("root", type = NodeType.Folder)
        val newStructureList = listOfNotNull(newStructure)

        if (toMove == null) {
            Logger.warn {
                "Path to move was not found in project. No nodes are therefore moved"
            }
        } else {
            insertInNewStructure(destinationPath.drop(1), newStructure)
        }
        return newStructureList
    }

    private fun removeMovedNodeFromStructure(originPath: List<String>, node: MutableNode): MutableNode? {
        return if (originPath.isEmpty() || originPath.first() != node.name) {
            node
        } else if (originPath.size == 1) {
            toMove = node.children.toMutableList()
            null
        } else {
            node.children =
                node.children.mapNotNull { child -> removeMovedNodeFromStructure(originPath.drop(1), child) }
                    .toMutableSet()
            node
        }
    }

    private fun insertInNewStructure(destinationPath: List<String>, node: MutableNode) {
        if (destinationPath.isEmpty()) {
            val destinationNodeNamesAndType: HashMap<String, NodeType?> = hashMapOf()
            node.children.forEach {
                destinationNodeNamesAndType[it.name] = it.type
            }

            val filteredNodesToMove =
                toMove!!.filter {
                    !(
                        destinationNodeNamesAndType.containsKey(
                            it.name
                        ) && destinationNodeNamesAndType[it.name] == it.type
                    )
                }
            if (filteredNodesToMove.size < toMove!!.size) {
                Logger.warn {
                    "Some nodes are already available in the target location, they were not moved and discarded instead."
                }
            }
            node.children.addAll(filteredNodesToMove)
        } else {
            var chosenChild: MutableNode? =
                node.children.filter {
                    destinationPath.first() == it.name
                }.firstOrNull()

            if (chosenChild == null) {
                node.children.add(MutableNode(destinationPath.first(), type = NodeType.Folder))
                chosenChild =
                    node.children.firstOrNull {
                        destinationPath.first() == it.name
                    }
            }
            insertInNewStructure(destinationPath.drop(1), chosenChild!!)
        }
    }

    private fun extractEdges(from: String, to: String): MutableList<Edge> {
        val sanitizedFrom = "/" + from.removeSuffix("/").removePrefix("/")
        val sanitizedTo = "/" + to.removeSuffix("/").removePrefix("/")
        return project.edges.map { edge ->
            edge.fromNodeName = edge.fromNodeName.replace(sanitizedFrom, sanitizedTo)
            edge.toNodeName = edge.toNodeName.replace(sanitizedFrom, sanitizedTo)
            edge
        }.toMutableList()
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

    private fun copyBlacklist(from: String, to: String): MutableList<BlacklistItem> {
        return project.blacklist.map { blacklistItem ->
            blacklistItem.path = blacklistItem.path.replace(from, to)
            blacklistItem
        }.toMutableList()
    }
}
