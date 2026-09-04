package de.maibornwolff.codecharta.analysers.parsers.dependency.processing.levelization

import de.maibornwolff.codecharta.analysers.parsers.dependency.processing.levelization.model.GraphNode

/**
 * A levelized graph indexed for repeated lookups.
 *
 * [GraphNode.findNodeById] is a recursive linear search and the upward-pointing rule needs two of them
 * plus an ancestor walk for every edge, which is quadratic in a file-level graph. Both the node lookup
 * and each node's ancestor chain are computed once here, in a single walk of the tree.
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

    fun levelOf(nodeId: String): Int? = nodesById[nodeId]?.level

    /**
     * Whether a dependency runs against the levelized flow. Nodes in one namespace compare their own
     * levels; nodes in different ones compare the levels of the sub-namespaces that are siblings under
     * their lowest common ancestor. A pair with no common ancestor, or a node the levelizer left
     * without a level, counts as not pointing upwards — the same fallback DependaCharta uses.
     */
    fun isPointingUpwards(sourceId: String, targetId: String): Boolean {
        val (sourceSibling, targetSibling) = siblingsUnderLowestCommonAncestor(sourceId, targetId) ?: return false
        val sourceLevel = sourceSibling.level ?: return false
        val targetLevel = targetSibling.level ?: return false
        return sourceLevel <= targetLevel
    }

    private fun siblingsUnderLowestCommonAncestor(sourceId: String, targetId: String): Pair<GraphNode, GraphNode>? {
        val sourceAncestors = ancestorsById[sourceId] ?: return null
        val targetAncestors = ancestorsById[targetId] ?: return null
        val targetAncestorByParent = targetAncestors.filter { it.parent != null }.associateBy { it.parent!! }
        return sourceAncestors
            .firstNotNullOfOrNull { sourceAncestor ->
                val parent = sourceAncestor.parent ?: return@firstNotNullOfOrNull null
                targetAncestorByParent[parent]?.let { sourceAncestor to it }
            }
    }
}
