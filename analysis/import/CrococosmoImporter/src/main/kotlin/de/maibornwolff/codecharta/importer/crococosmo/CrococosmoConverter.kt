package de.maibornwolff.codecharta.importer.crococosmo

import de.maibornwolff.codecharta.importer.crococosmo.model.Graph
import de.maibornwolff.codecharta.importer.crococosmo.model.SchemaVersion
import de.maibornwolff.codecharta.importer.crococosmo.model.Version
import de.maibornwolff.codecharta.model.Node
import de.maibornwolff.codecharta.model.NodeType
import de.maibornwolff.codecharta.model.Project

class CrococosmoConverter {
    fun convertToProjectsMap(graph: Graph): Map<String, Project> {
        return graph.schema.versions.versions
            .associateBy({ createVersionName(it) }, { createProject(graph, it.id) })
    }

    private fun createVersionName(it: SchemaVersion) =
        when {
            it.name.isNotEmpty() -> it.name
            it.revision.isNotEmpty() -> it.revision
            else -> it.id
        }

    fun createProject(graph: Graph, version: String = graph.schema.versions.versions.first().id) =
        Project("", createNodeListForProject(graph.nodes, version))

    private fun createNodeListForProject(
        nodes: List<de.maibornwolff.codecharta.importer.crococosmo.model.Node>,
        version: String
    ): List<Node> {
        return listOf(Node("root", NodeType.Folder, mapOf(), "", convertToNodeList(nodes, version)))
    }

    private fun convertToNodeList(
        origin: List<de.maibornwolff.codecharta.importer.crococosmo.model.Node>,
        version: String
    ): Set<Node> {
        return when {
            origin.isEmpty() -> setOf()
            else -> origin.map { convertToNode(it, version) }.reduce { a, b -> a + b }.toSet()
        }
    }

    private fun convertToNode(
        origin: de.maibornwolff.codecharta.importer.crococosmo.model.Node,
        version: String
    ): Set<Node> {
        return when {
            origin.name.isNullOrEmpty() -> convertToNodeList(origin.children.orEmpty(), version)
            else -> setOf(
                Node(
                    origin.name, getNodeType(origin), createAttributeListForNode(origin.versions, version), "",
                    convertToNodeList(origin.children.orEmpty(), version)
                )
            )
        }
    }

    private fun getNodeType(node: de.maibornwolff.codecharta.importer.crococosmo.model.Node): NodeType {
        return when {
            node.versions.orEmpty().isEmpty() -> NodeType.Folder
            else -> NodeType.File
        }
    }

    private fun createAttributeListForNode(version: List<Version>?, id: String): Map<String, Float> {
        val correctVersion = version.orEmpty().filter { v -> id == v.id }
        return when {
            correctVersion.isEmpty() -> mapOf()
            correctVersion.last().attribute != null -> correctVersion.last().attribute!!.map(
                { Pair(it.name, it.value.toFloat()) }).toMap()
            else -> mapOf()
        }
    }
}
