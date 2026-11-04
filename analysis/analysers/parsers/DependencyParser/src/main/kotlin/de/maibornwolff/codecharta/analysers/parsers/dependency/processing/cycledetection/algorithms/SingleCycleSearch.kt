package de.maibornwolff.codecharta.analysers.parsers.dependency.processing.cycledetection.algorithms

/**
 * Searches one cycle from a start node, depth first along the edges in their order, on a stack of its own, so a long
 * chain cannot overflow the call stack. Without a length limit, a node whose search found no cycle is not searched
 * again: it reaches no node of the path it was entered on, so no node of any path that leads to it, and no cycle of
 * its own, and the processed nodes, which stop a search, only grow.
 */
internal class SingleCycleSearch(
    private val edgesByStartNode: Map<Int, List<NumberEdge>>,
    private val processedNodes: MutableSet<Int>,
    private val maxCycleLength: Int
) {
    private val nodesWithoutCycle = mutableSetOf<Int>()
    private val frames = ArrayDeque<SearchFrame>()
    private val nodesOnPath = mutableSetOf<Int>()
    private val pathEdges = mutableListOf<NumberEdge>()

    fun findCycleFrom(startNode: Int): List<NumberEdge>? {
        enter(startNode)
        while (frames.isNotEmpty()) {
            val edge = frames.last().nextEdge()
            if (edge == null) {
                leave()
            } else {
                pathEdges.add(edge)
                val cycle = follow(edge.to)
                if (cycle != null) return cycle.also { clearPath() }
            }
        }
        return null
    }

    private fun follow(node: Int): List<NumberEdge>? {
        if (node in nodesOnPath) return closeCycleAt(node)
        if (node in processedNodes || !enter(node)) dropLastEdge()
        return null
    }

    private fun enter(node: Int): Boolean {
        val outgoingEdges = edgesByStartNode[node].orEmpty()
        if (node in nodesWithoutCycle || pathEdges.size >= maxCycleLength || outgoingEdges.isEmpty()) return false
        nodesOnPath.add(node)
        frames.addLast(SearchFrame(node, outgoingEdges))
        return true
    }

    private fun leave() {
        val frame = frames.removeLast()
        nodesOnPath.remove(frame.node)
        if (maxCycleLength == Int.MAX_VALUE) nodesWithoutCycle.add(frame.node)
        if (frames.isNotEmpty()) dropLastEdge()
    }

    private fun closeCycleAt(node: Int): List<NumberEdge> {
        processedNodes.addAll(nodesOnPath)
        return pathEdges.subList(pathEdges.indexOfLast { it.from == node }, pathEdges.size).toList()
    }

    private fun dropLastEdge() {
        pathEdges.removeAt(pathEdges.lastIndex)
    }

    private fun clearPath() {
        frames.clear()
        nodesOnPath.clear()
        pathEdges.clear()
    }

    private class SearchFrame(val node: Int, private val outgoingEdges: List<NumberEdge>) {
        private var nextEdgeIndex = 0

        fun nextEdge(): NumberEdge? = outgoingEdges.getOrNull(nextEdgeIndex++)
    }
}
