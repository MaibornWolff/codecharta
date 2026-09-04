package de.maibornwolff.codecharta.analysers.parsers.dependency.output

import de.maibornwolff.codecharta.analysers.filters.mergefilter.MergeFilter
import de.maibornwolff.codecharta.analysers.parsers.dependency.processing.DependencyGraph
import de.maibornwolff.codecharta.model.AttributeType
import de.maibornwolff.codecharta.model.AttributeTypes
import de.maibornwolff.codecharta.model.DependencyNode
import de.maibornwolff.codecharta.model.Edge
import de.maibornwolff.codecharta.model.MutableNode
import de.maibornwolff.codecharta.model.NodeId
import de.maibornwolff.codecharta.model.NodeType
import de.maibornwolff.codecharta.model.Path
import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.model.ProjectBuilder

/**
 * Writes the file-level dependency graph into a project: the files as the tree, the dependencies as
 * the dependency lens, and the per-file link counts as ordinary metrics.
 */
class DependencyProjectGenerator(private val projectBuilder: ProjectBuilder = ProjectBuilder()) {
    fun generate(graph: DependencyGraph, analysedFilePaths: List<List<String>>, pipedProject: Project? = null): Project {
        val linkCounts = countLinksPerFile(graph, analysedFilePaths)
        analysedFilePaths.forEach { segments -> insertFileNode(segments, linkCounts.getValue(segments)) }
        graph.edges.forEach { edge ->
            projectBuilder.insertEdge(
                Edge(
                    fromNodeName = NodeId.endpointFromSegments(edge.fromPath),
                    toNodeName = NodeId.endpointFromSegments(edge.toPath),
                    attributes = mapOf(DEPENDENCIES to edge.weight),
                    isCyclic = edge.isCyclic,
                    isPointingUpwards = edge.isPointingUpwards
                )
            )
        }

        val project =
            projectBuilder
                .addAttributeTypes(AttributeTypes(mutableMapOf(DEPENDENCIES to AttributeType.ABSOLUTE), EDGE_ATTRIBUTE_TYPE))
                .addAttributeTypes(
                    AttributeTypes(
                        mutableMapOf(
                            OUTGOING_DEPENDENCIES to AttributeType.ABSOLUTE,
                            INCOMING_DEPENDENCIES to AttributeType.ABSOLUTE
                        ),
                        NODE_ATTRIBUTE_TYPE
                    )
                ).addAttributeDescriptions(dependencyAttributeDescriptors())
                .withDependencyNodes(toDependencyNodes(graph))
                .build()

        return if (pipedProject != null) MergeFilter.mergePipedWithCurrentProject(pipedProject, project) else project
    }

    private fun insertFileNode(segments: List<String>, attributes: Map<String, Any>) {
        if (segments.isEmpty()) return
        projectBuilder.insertByPath(Path(segments.dropLast(1)), MutableNode(segments.last(), NodeType.File, attributes))
    }

    /**
     * Outgoing and incoming counts are metrics about a file, not lens structure, so they go on the node
     * itself. Both count dependency links, i.e. the summed edge weights, so a file that references
     * another one five times counts five.
     */
    private fun countLinksPerFile(graph: DependencyGraph, analysedFilePaths: List<List<String>>): Map<List<String>, Map<String, Any>> {
        val outgoing = HashMap<List<String>, Int>()
        val incoming = HashMap<List<String>, Int>()
        graph.edges.forEach { edge ->
            outgoing.merge(edge.fromPath, edge.weight, Int::plus)
            incoming.merge(edge.toPath, edge.weight, Int::plus)
        }
        // Every analysed file carries both counts, zero included, so the metric is defined across the
        // whole map rather than only where a dependency happens to exist.
        return analysedFilePaths.associateWith { path ->
            mapOf(
                OUTGOING_DEPENDENCIES to (outgoing[path] ?: 0),
                INCOMING_DEPENDENCIES to (incoming[path] ?: 0)
            )
        }
    }

    private fun toDependencyNodes(graph: DependencyGraph): Map<String, DependencyNode> = graph.levels.associate { levelizedPath ->
        val type = if (levelizedPath.isFile) NodeType.File else NodeType.Folder
        NodeId.fromSegments(levelizedPath.path, type) to DependencyNode(levelizedPath.level)
    }

    companion object {
        private const val NODE_ATTRIBUTE_TYPE = "nodes"
        private const val EDGE_ATTRIBUTE_TYPE = "edges"
    }
}
