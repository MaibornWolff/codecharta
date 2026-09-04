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
         * Finds a node by its ID in the tree.
         */
        fun findNodeById(root: GraphNode, id: String): GraphNode? {
            if (root.id == id) return root
            for (child in root.children) {
                val found = findNodeById(child, id)
                if (found != null) return found
            }
            return null
        }

        /**
         * Gets all ancestors of a node, including the node itself.
         * Returns a list starting with the node and ending with the root.
         */
        fun getAncestors(node: GraphNode, root: GraphNode): List<GraphNode> {
            val ancestors = mutableListOf(node)
            var current = node
            var parentId = current.parent
            while (parentId != null) {
                val parent = findNodeById(root, parentId)
                    ?: throw IllegalStateException("Parent $parentId not found for node ${current.id}")
                ancestors.add(parent)
                current = parent
                parentId = current.parent
            }
            return ancestors
        }

        /**
         * Finds siblings under the lowest common ancestor.
         * Returns a pair of (sourceAncestor, targetAncestor) that are siblings.
         */
        fun findSiblingsUnderLowestCommonAncestor(source: GraphNode, target: GraphNode, root: GraphNode): Pair<GraphNode, GraphNode> {
            val sourceAncestors = getAncestors(source, root)
            val targetAncestors = getAncestors(target, root)

            for (sourceAncestor in sourceAncestors) {
                for (targetAncestor in targetAncestors) {
                    // Check if they share the same parent
                    if (sourceAncestor.parent != null &&
                        targetAncestor.parent != null &&
                        sourceAncestor.parent == targetAncestor.parent
                    ) {
                        return Pair(sourceAncestor, targetAncestor)
                    }
                }
            }

            throw IllegalStateException("No common ancestor found for ${source.id} and ${target.id}")
        }

        /**
         * Calculates if an edge points upwards (violates normal dependency flow).
         * An edge points upwards when sourceLevel <= targetLevel under their lowest common ancestor.
         */
        fun calculateIsPointingUpwards(sourceId: String, targetId: String, root: GraphNode): Boolean {
            val source = findNodeById(root, sourceId)
                ?: throw IllegalStateException("Source node $sourceId not found")
            val target = findNodeById(root, targetId)
                ?: throw IllegalStateException("Target node $targetId not found")

            val (sourceAncestor, targetAncestor) = findSiblingsUnderLowestCommonAncestor(source, target, root)
            return sourceAncestor.level!! <= targetAncestor.level!!
        }

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
