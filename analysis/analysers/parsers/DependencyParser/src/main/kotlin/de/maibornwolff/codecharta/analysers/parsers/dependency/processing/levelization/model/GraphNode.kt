package de.maibornwolff.codecharta.analysers.parsers.dependency.processing.levelization.model

data class GraphNode(
    val id: String,
    val parent: String?,
    val children: List<GraphNode>,
    val level: Int? = null,
    val dependencies: Set<String> = emptySet(),
    val edges: Set<GraphEdge> = emptySet()
) {
    companion object {
        /**
         * Wraps multiple root nodes in a virtual root to enable cross-root dependency analysis.
         * For single roots, returns the root unchanged.
         *
         * @throws IllegalArgumentException if the node list is empty
         * @throws IllegalStateException if any node already has a parent (should be true roots)
         * @return Pair of (nodes with updated parent, unified root for analysis)
         */
        fun wrapInVirtualRootIfNeeded(nodes: List<GraphNode>): Pair<List<GraphNode>, GraphNode> {
            if (nodes.isEmpty()) {
                throw IllegalArgumentException("Cannot wrap empty node list")
            }

            return if (nodes.size > 1) {
                // Validate that all nodes are true roots (parent = null)
                val nodesWithParents = nodes.filter { it.parent != null }
                if (nodesWithParents.isNotEmpty()) {
                    throw IllegalStateException(
                        "Expected root nodes with parent=null, but found ${nodesWithParents.size} nodes with parents: " +
                            nodesWithParents.joinToString(", ") { "${it.id} (parent=${it.parent})" }
                    )
                }

                val virtualRootId = "__virtual_root__"
                val nodesWithParent = nodes.map { it.copy(parent = virtualRootId) }
                val virtualRoot = GraphNode(
                    id = virtualRootId,
                    parent = null,
                    children = nodesWithParent,
                    level = null,
                    dependencies = emptySet(),
                    edges = emptySet()
                )
                Pair(nodesWithParent, virtualRoot)
            } else {
                val singleRoot = nodes.first()
                Pair(listOf(singleRoot), singleRoot)
            }
        }
    }
}
