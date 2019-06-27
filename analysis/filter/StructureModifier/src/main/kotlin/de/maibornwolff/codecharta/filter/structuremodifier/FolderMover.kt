package de.maibornwolff.codecharta.filter.structuremodifier

import de.maibornwolff.codecharta.model.*
import mu.KotlinLogging

class FolderMover(private val project: Project, private val projectName: String?) {

    private val logger = KotlinLogging.logger { }
    private var toMove: List<MutableNode>? = null

    fun move(moveFrom: String?, moveTo: String?): Project? {
        if ((moveFrom == null) || (moveTo == null)) {
            logger.error("In order to move nodes, both source and destination need to be set.")
            return null
        }

        return ProjectBuilder(
                projectName ?: project.projectName,
                moveNodes(moveFrom, moveTo),
                extractEdges(moveFrom, moveTo),
                copyAttributeTypes(),
                copyBlacklist(moveFrom, moveTo)
        ).build()
    }

    private fun getPathSegments(path: String): List<String> {
        return path.removePrefix("/").split("/").filter { it.isNotEmpty() }
    }

    private fun moveNodes(moveFrom: String, moveTo: String): List<MutableNode> {
        val originPath = getPathSegments(moveFrom)
        val destinationPath = getPathSegments(moveTo)
        val rootNode = project.rootNode.toMutableNode()

        val newStructure = removeMovedNodeFromStructure(originPath, rootNode)
                ?: MutableNode("root", type = NodeType.Folder)
        val newStructureList = listOfNotNull(newStructure)

        if (toMove == null) {
            logger.warn("Path to move was not found in project. No nodes are therefore moved")
        } else {
            insertInNewStructure(destinationPath.drop(1), newStructure)
        }
        return newStructureList
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
            val destinationNodeNamesAndType: HashMap<String, NodeType?> = hashMapOf()
            node.children.forEach { destinationNodeNamesAndType[it.name] = it.type }

            val filteredNodesToMove = toMove!!.filter {
                !(destinationNodeNamesAndType.containsKey(it.name) && destinationNodeNamesAndType[it.name] == it.type)
            }
            if (filteredNodesToMove.size < toMove!!.size) {
                logger.warn("Some nodes are already available in the target location, they were not moved and discarded instead.")
            }
            node.children.addAll(filteredNodesToMove)

        } else {
            var chosenChild: MutableNode? = node.children.filter { destinationPath.first() == it.name }.firstOrNull()

            if (chosenChild == null) {
                node.children.add(MutableNode(destinationPath.first(), type = NodeType.Folder))
                chosenChild = node.children.firstOrNull { destinationPath.first() == it.name }
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

    private fun copyAttributeTypes(): MutableMap<String, MutableList<Map<String, AttributeType>>> {
        val mergedAttributeTypes: MutableMap<String, MutableList<Map<String, AttributeType>>> = mutableMapOf()
        project.attributeTypes.forEach {
            mergedAttributeTypes[it.key] = it.value.toMutableList()
        }
        return mergedAttributeTypes.toMutableMap()
    }

    private fun copyBlacklist(from: String, to: String): MutableList<BlacklistItem> {
        return project.blacklist.map { blacklistItem ->
            blacklistItem.path = blacklistItem.path.replace(from, to)
            blacklistItem
        }.toMutableList()
    }
}