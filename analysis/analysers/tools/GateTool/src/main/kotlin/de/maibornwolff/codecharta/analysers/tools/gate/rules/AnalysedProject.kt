package de.maibornwolff.codecharta.analysers.tools.gate.rules

import de.maibornwolff.codecharta.model.DependencyLens
import de.maibornwolff.codecharta.model.Edge
import de.maibornwolff.codecharta.model.NodeId
import de.maibornwolff.codecharta.model.NodeType
import de.maibornwolff.codecharta.model.Project

data class AnalysedFile(val path: String, val metrics: Map<String, Double>)

class AnalysedProject(private val project: Project) {
    val files: List<AnalysedFile> by lazy {
        project.rootNode.nodes
            .filter { (_, node) -> node.type == NodeType.File }
            .map { (path, node) -> AnalysedFile(path.edgesList.joinToString(NodeId.SEPARATOR), numericAttributes(node.attributes)) }
    }

    val metricTitles: Map<String, String> by lazy {
        project.lenses.metrics.attributeDescriptors
            .mapValues { (_, descriptor) -> descriptor.title.ifBlank { descriptor.description } }
            .filterValues { it.isNotBlank() }
    }

    val dependencyAnalysis: DependencyAnalysis? by lazy {
        val lens = project.lenses.dependency
        if (lens.nodes.isEmpty()) return@lazy null
        val pathById = files.associate { NodeId.fromSegments(it.path.split(NodeId.SEPARATOR)) to it.path }
        DependencyAnalysis(declarationDependencies(lens, pathById), upwardOfFilePair(lens.edges, pathById))
    }

    private fun declarationDependencies(lens: DependencyLens, pathById: Map<String, String>): List<DeclarationDependency> =
        lens.leafEdges.mapNotNull { leafEdge ->
            val from = declarationOf(lens, pathById, leafEdge.fromId, leafEdge.fromLeaf) ?: return@mapNotNull null
            val to = declarationOf(lens, pathById, leafEdge.toId, leafEdge.toLeaf) ?: return@mapNotNull null
            DeclarationDependency(from, to, leafEdge.isCyclic, leafEdge.isPointingUpwards)
        }

    private fun declarationOf(lens: DependencyLens, pathById: Map<String, String>, fileId: String, leafKey: String): Declaration? {
        val path = pathById[fileId] ?: return null
        return if (lens.leaves[fileId]?.containsKey(leafKey) == true) Declaration(path, leafKey) else null
    }

    private fun upwardOfFilePair(edges: List<Edge>, pathById: Map<String, String>): Map<Pair<String, String>, Boolean> = edges
        .filter { ((it.attributes[DEPENDENCIES_METRIC] as? Number)?.toDouble() ?: 0.0) > 0.0 }
        .mapNotNull { edge ->
            val from = pathById[NodeId.fromEndpoint(edge.fromNodeName)] ?: return@mapNotNull null
            val to = pathById[NodeId.fromEndpoint(edge.toNodeName)] ?: return@mapNotNull null
            (from to to) to edge.isPointingUpwards
        }.groupBy({ it.first }, { it.second })
        .mapValues { (_, marks) -> marks.any { it } }

    private fun numericAttributes(attributes: Map<String, Any>): Map<String, Double> = attributes
        .mapNotNull { (name, value) -> (value as? Number)?.let { name to it.toDouble() } }
        .toMap()

    companion object {
        private const val DEPENDENCIES_METRIC = "dependencies"
    }
}
