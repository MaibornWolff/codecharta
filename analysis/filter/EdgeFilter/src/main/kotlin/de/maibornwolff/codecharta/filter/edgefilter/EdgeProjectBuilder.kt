package de.maibornwolff.codecharta.filter.edgefilter

import de.maibornwolff.codecharta.model.*
import mu.KotlinLogging
import kotlin.math.max

class EdgeProjectBuilder(private val project: Project, private val pathSeparator: Char) {
    private val logger = KotlinLogging.logger {}

    private val projectBuilder = ProjectBuilder(
            listOf(MutableNode("root", NodeType.Folder)),
            mutableListOf(),
            getAttributeTypes())

    private fun getAttributeTypes(): MutableMap<String, MutableList<Map<String, AttributeType>>> {
        val newAttributetypes: MutableMap<String, MutableList<Map<String, AttributeType>>> = mutableMapOf()
        project.attributeTypes.forEach {
            newAttributetypes[it.key] = it.value.toMutableList()
        }
        return newAttributetypes
    }

    fun merge(): Project {
        insertEdges()
        insertEmptyNodesFromEdges()
        insertNodesFromOriginProject()
        insertNodesWithAttributesFromEdges()
        return projectBuilder.build()
    }

    private fun insertEdges() {
        project.edges.forEach {
            projectBuilder.insertEdge(it)
        }
    }

    private fun insertEmptyNodesFromEdges() {
        project.edges.forEach {
            insertEdgeAsNode(it.fromNodeName)
            insertEdgeAsNode(it.toNodeName)
        }
    }

    private fun insertNodesFromOriginProject() {
        insertEdgeAttributesIntoNodes(project.rootNode.children)
    }

    private fun insertNodesWithAttributesFromEdges() {
        insertEdgeAttributesIntoNodes(projectBuilder.rootNode.children.map { it.toNode() })
    }

    private fun insertEdgeAsNode(nodeEdgeName: String) {
        val nodeFilename = nodeEdgeName.split(pathSeparator).reversed().first()
        val nodePath = nodeEdgeName.split(pathSeparator)
        val nodeParentPath = nodePath.subList(2, max(2, nodePath.size - 1))
        val node = Node(nodeFilename, NodeType.File)
        insertNodeInProjectBuilder(node, nodeParentPath)
    }

    private fun insertEdgeAttributesIntoNodes(nodes: List<Node>, parentPath: MutableList<String> = mutableListOf()) {
        nodes.forEach {
            val node = Node(it.name, it.type, getAttributes(it, parentPath), it.link)
            insertNodeInProjectBuilder(node, parentPath.toList())
            if (it.children.isNotEmpty()) {
                val newParentPath = parentPath.toMutableList() // clone object
                newParentPath.add(it.name)
                insertEdgeAttributesIntoNodes(it.children, newParentPath)
            }
        }
    }

    private fun insertNodeInProjectBuilder(node: Node, parentPath: List<String>) {
        try {
            projectBuilder.insertByPath(Path(parentPath), node.toMutableNode())
        } catch (e: IllegalArgumentException) {
            logger.warn { "Node $node not inserted due to ${e.message}" }
        }
    }

    private fun getAttributes(node: Node, parentPath: List<String>): Map<String, Any> {
        val attributes: MutableMap<String, Any> = node.attributes.toMutableMap()
        attributes.putAll(getAggregatedEdgeAttributes(node, parentPath))
        return attributes.toMap()
    }

    private fun getAggregatedEdgeAttributes(node: Node, parentPath: List<String>): MutableMap<String, Any> {
        val nodePath: String = getNodePathAsString(parentPath, node.name)
        val filteredEdges: List<Edge> = project.edges.filter { edge ->
            edge.fromNodeName == nodePath || edge.toNodeName == nodePath
        }
        val attributeKeys: MutableList<String> = getAttributeKeys(filteredEdges)
        return getAggregatedAttributes(attributeKeys, filteredEdges)
    }

    private fun getNodePathAsString(path: List<String>, leafName: String): String {
        var nodePath = pathSeparator + "root"
        path.forEach { nodePath += pathSeparator + it }
        nodePath += pathSeparator + leafName
        return nodePath
    }

    private fun getAttributeKeys(filteredEdges: List<Edge>): MutableList<String> {
        val attributeKeys: MutableList<String> = mutableListOf()
        filteredEdges.forEach {
            it.attributes.forEach { key, _ -> if (!attributeKeys.contains(key)) attributeKeys.add(key) }
        }
        return attributeKeys
    }

    private fun getAggregatedAttributes(listOfAttributes: MutableList<String>,
                                        filteredEdges: List<Edge>): MutableMap<String, Any> {
        val aggregatedAttributes: MutableMap<String, Any> = mutableMapOf()

        listOfAttributes.forEach { key: String ->
            val attributeType = getAttributeTypeByKey(key)
            val filteredAttribute = filteredEdges.filter { edge: Edge -> edge.attributes.containsKey(key) }
            var aggregatedAttributeValue =
                    filteredAttribute.sumBy { edge: Edge -> edge.attributes[key].toString().toFloat().toInt() }

            if (attributeType == AttributeType.relative) aggregatedAttributeValue /= filteredAttribute.size

            aggregatedAttributes[key] = aggregatedAttributeValue
        }
        return aggregatedAttributes
    }

    private fun getAttributeTypeByKey(key: String): AttributeType {
        project.attributeTypes["edges"]?.forEach {
            if (it.containsKey(key)) {
                // Returning it[key] directly may cause a ClassCastException
                when (it[key].toString()) {
                    "relative" -> return AttributeType.relative
                    "absolute" -> return AttributeType.absolute
                }
            }
        }
        return AttributeType.absolute
    }
}