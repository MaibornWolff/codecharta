package de.maibornwolff.codecharta.analysers.parsers.dependency.processing.levelization

import de.maibornwolff.codecharta.analysers.parsers.dependency.processing.levelization.model.GraphNode

/**
 * A levelized graph indexed for repeated lookups, and the home of the upward-pointing rule.
 *
 * Finding a node in the tree is a recursive linear search, and the rule needs two of them plus an
 * ancestor walk for every edge — quadratic on a file-level graph. Both the node lookup and each node's
 * ancestor chain are computed here in a single walk, once per graph.
 */
class GraphIndex(root: GraphNode) {
    private val nodesById = HashMap<String, GraphNode>()

    // Node id -> the node's ancestors, nearest first, starting with the node itself and ending at the root.
    private val ancestorsById = HashMap<String, List<GraphNode>>()

    init {
        indexSubtree(root, emptyList())
    }

    private fun indexSubtree(node: GraphNode, ancestorsAbove: List<GraphNode>) {
        val ancestors = listOf(node) + ancestorsAbove
        nodesById[node.id] = node
        ancestorsById[node.id] = ancestors
        node.children.forEach { child -> indexSubtree(child, ancestors) }
    }

    fun nodeById(nodeId: String): GraphNode? = nodesById[nodeId]

    /**
     * Whether a dependency runs against the levelized flow. Nodes in one namespace compare their own
     * levels; nodes in different ones compare the levels of the sub-namespaces that are siblings under
     * their lowest common ancestor. A node the levelizer left without a level counts as not pointing
     * upwards, since there is nothing to compare.
     *
     * @throws IllegalStateException when either id is not in this graph, or the two share no ancestor —
     *   which for separate top-level roots means they were not wrapped in a virtual root first.
     */
    fun isPointingUpwards(sourceId: String, targetId: String): Boolean {
        val (sourceSibling, targetSibling) = siblingsUnderLowestCommonAncestor(sourceId, targetId)
        val sourceLevel = sourceSibling.level ?: return false
        val targetLevel = targetSibling.level ?: return false
        return sourceLevel <= targetLevel
    }

    private fun siblingsUnderLowestCommonAncestor(sourceId: String, targetId: String): Pair<GraphNode, GraphNode> {
        val sourceAncestors = ancestorsById[sourceId] ?: throw IllegalStateException("Source node $sourceId not found")
        val targetAncestors = ancestorsById[targetId] ?: throw IllegalStateException("Target node $targetId not found")
        val targetAncestorByParent = targetAncestors.filter { it.parent != null }.associateBy { it.parent!! }
        return sourceAncestors.firstNotNullOfOrNull { sourceAncestor ->
            val parent = sourceAncestor.parent ?: return@firstNotNullOfOrNull null
            targetAncestorByParent[parent]?.let { sourceAncestor to it }
        } ?: throw IllegalStateException("No common ancestor found for $sourceId and $targetId")
    }
}
