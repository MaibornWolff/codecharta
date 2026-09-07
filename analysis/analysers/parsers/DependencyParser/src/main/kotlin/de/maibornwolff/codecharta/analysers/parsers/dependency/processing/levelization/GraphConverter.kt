package de.maibornwolff.codecharta.analysers.parsers.dependency.processing.levelization

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Node
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import de.maibornwolff.codecharta.analysers.parsers.dependency.processing.levelization.model.GraphEdge
import de.maibornwolff.codecharta.analysers.parsers.dependency.processing.levelization.model.GraphNode

/**
 * One node of the graph to levelize, addressed by the path whose segments become the containing
 * namespaces. Declarations use their logical package path; files use their physical folder path.
 */
data class GraphLeaf(val path: Path, val edges: Set<GraphEdge>)

fun Collection<Node>.toGraphNodes(): List<GraphNode> = map { leaf ->
    val leafId = leaf.pathWithName.withDots()
    GraphLeaf(
        path = leaf.pathWithName,
        edges = leaf.resolvedNodeDependencies.internalDependencies
            .map { GraphEdge(leafId, it.withDots(), 1, it.type.rawValue) }
            .toSet()
    )
}.toGraphTree()

fun Collection<GraphLeaf>.toGraphTree(): List<GraphNode> = buildTree(null, 0, this).toList()

private fun buildTree(parentId: String?, pathLevel: Int, leaves: Collection<GraphLeaf>): Set<GraphNode> {
    val nextLevel = pathLevel + 1
    val leafNodes = leaves.filter { it.path.parts.size == nextLevel }.map { leaf ->
        GraphNode(
            id = leaf.path.withDots(),
            parent = parentId,
            children = listOf(),
            dependencies = leaf.edges.map { it.target }.toSet(),
            edges = leaf.edges
        )
    }
    val subTreeRoots = leaves.filter { it.path.parts.size > nextLevel }
    val byPath = subTreeRoots.groupBy { it.path.parts[pathLevel] }
    val subTrees = byPath.map { (subTreePath, subTreeLeaves) ->
        val nodeId = if (!parentId.isNullOrEmpty()) "$parentId.$subTreePath" else subTreePath
        val children = buildTree(nodeId, nextLevel, subTreeLeaves).toList()
        GraphNode(
            id = nodeId,
            parent = parentId,
            children = children,
            edges = children.flatMap { it.edges }.toSet()
        )
    }
    return (leafNodes + subTrees).toSet()
}
