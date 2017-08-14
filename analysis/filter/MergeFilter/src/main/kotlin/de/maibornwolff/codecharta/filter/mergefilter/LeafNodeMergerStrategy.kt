package de.maibornwolff.codecharta.filter.mergefilter

import de.maibornwolff.codecharta.model.Node
import de.maibornwolff.codecharta.model.Path
import de.maibornwolff.codecharta.nodeinserter.NodeInserter

/**
 * merges leafs according to the level of matching of their paths
 */
class LeafNodeMergerStrategy(val addMisfittingNodes: Boolean) : NodeMergerStrategy {
    private val flatNodeMerger = NodeMerger()

    private val mergeConditionSatisfied = { n1: Node, n2: Node -> n1.name == n2.name }
    /**
     * merge list of nodeLists to single nodeList
     */
    override fun mergeNodeLists(lists: List<List<Node>>?): List<Node> {
        if (lists!!.isEmpty()) {
            return listOf()
        }
        val reference = lists.first()
        return lists.drop(1).fold(reference, { acc, nodes ->
            nodes.fold(acc, {
                acc: List<Node>, node: Node ->
                acc.flatMap { if (mergeConditionSatisfied(it, node)) merge(it, node) else listOf(it) }
            })
        })
    }

    /**
     * merge multiple nodes
     */
    private fun merge(vararg nodes: Node): List<Node> {
        val root = flatNodeMerger.merge(*nodes)
        val reference = nodes.first().nodes
        nodes.toList()
                .fold(reference, { acc, node -> mergeInto(acc, node.nodes) })
                .forEach { NodeInserter.insertByPath(root, Path(it.key.edgesList.dropLast(1)), it.value) }
        return listOf(root)
    }

    private fun mergeInto(acc: Map<Path, Node>, nodes: Map<Path, Node>): Map<Path, Node> {
        val newNodes = nodes.filterValues { it.isLeaf }
                .mapKeys { findFittingPathOrNull(acc.keys, it.key) ?: replaceMisfittingPath(it.key) }
                .filterKeys { !it.isTrivial }
        val unchangedNodes = acc.filterValues { it.isLeaf }.filterKeys { !newNodes.keys.contains(it) }

        return newNodes
                .plus(unchangedNodes)
                .mapValues { flatNodeMerger.merge(it.value, acc[it.key] ?: it.value) }
    }

    private fun replaceMisfittingPath(path: Path): Path {
        return when {
            addMisfittingNodes -> path
            else -> Path.TRIVIAL
        }
    }

    private fun pathDistance(path1: Path, path2: Path): Int {
        val reversedEdges1 = path1.edgesList.asReversed()
        val reversedEdges2 = path2.edgesList.asReversed()
        val minSize = minOf(reversedEdges1.size, reversedEdges2.size)
        return (0..minSize - 1).firstOrNull { reversedEdges1[it] != reversedEdges2[it] } ?: minSize
    }

    private fun findFittingPathOrNull(reference: Set<Path>, path: Path): Path? {
        val matchingLeaf = reference.filter { !it.isTrivial }.maxBy { pathDistance(path, it) } ?: path
        return when {
            pathDistance(path, matchingLeaf) == 0 -> null
            else -> matchingLeaf
        }
    }
}
