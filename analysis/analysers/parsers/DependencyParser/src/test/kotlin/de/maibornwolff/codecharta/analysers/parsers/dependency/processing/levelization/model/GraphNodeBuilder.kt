package de.maibornwolff.codecharta.analysers.parsers.dependency.processing.levelization.model

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.TypeOfUsage

class GraphNodeBuilder(
    val id: String,
    val parent: String? = null,
    var children: List<GraphNode> = emptyList(),
    val level: Int = 0,
    val dependencies: Set<String> = emptySet(),
    var edges: MutableSet<GraphEdge> = mutableSetOf()
) {
    private fun fullId() = if (parent == null) id else "$parent.$id"

    fun build(): GraphNode = GraphNode(fullId(), parent, children, level, dependencies, edges)

    fun withChildren(vararg children: GraphNode): GraphNodeBuilder {
        this.children = children.toList()
        this.edges = children.flatMap { it.edges }.toMutableSet()
        return this
    }

    fun withEdge(target: String, weight: Int): GraphNodeBuilder {
        this.edges.add(GraphEdge(fullId(), target, weight, TypeOfUsage.USAGE.rawValue))
        return this
    }
}
