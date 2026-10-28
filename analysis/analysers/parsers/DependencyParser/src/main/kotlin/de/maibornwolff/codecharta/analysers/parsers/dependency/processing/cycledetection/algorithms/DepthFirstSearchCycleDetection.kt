package de.maibornwolff.codecharta.analysers.parsers.dependency.processing.cycledetection.algorithms

data class NumberEdge(val from: Int, var to: Int)

class DepthFirstSearchCycleDetection(private val edges: List<NumberEdge>) {
    private val processedNodes = mutableSetOf<Int>()

    fun detectSingleCycle(): Set<List<NumberEdge>> {
        val nodes = edges.flatMap { listOf(it.from, it.to) }.toSet()
        val edgeLookup = edges.groupBy { it.from }.toMap()
        val cycles = nodes.flatMap {
            if (processedNodes.contains(it)) {
                listOf()
            } else {
                val (processedNodeIds, cycles) = this.getCycles(it, edgeLookup, setOf(), listOf())
                processedNodes.addAll(processedNodeIds)
                cycles
            }
        }
        return filterDuplicates(cycles).toSet()
    }

    private fun getCycles(
        currentNode: Int,
        allEdges: Map<Int, List<NumberEdge>>,
        visitedNodeIds: Set<Int>,
        visitedEdges: List<NumberEdge>
    ): CycleResult {
        if (visitedNodeIds.contains(currentNode) || processedNodes.contains(currentNode)) {
            val lastEdgeFromCurrentNodeIndex = visitedEdges.indexOfLast { it.from == currentNode }
            return if (lastEdgeFromCurrentNodeIndex > -1) {
                CycleResult(
                    visitedNodeIds = visitedNodeIds,
                    cycles = listOf(visitedEdges.slice(lastEdgeFromCurrentNodeIndex..<visitedEdges.size))
                )
            } else {
                CycleResult(cycles = listOf(), visitedNodeIds = visitedNodeIds)
            }
        }
        val outgoingEdges = allEdges[currentNode] ?: emptyList()
        if (outgoingEdges.isEmpty()) {
            return CycleResult(cycles = listOf(), visitedNodeIds = visitedNodeIds)
        }
        return firstCycleThrough(outgoingEdges, allEdges, visitedNodeIds, currentNode, visitedEdges)
    }

    private fun firstCycleThrough(
        outgoingEdges: List<NumberEdge>,
        allEdges: Map<Int, List<NumberEdge>>,
        visitedNodeIds: Set<Int>,
        currentNode: Int,
        visitedEdges: List<NumberEdge>
    ): CycleResult {
        outgoingEdges.forEach { edge ->
            val cycleOfChild = this.getCycles(edge.to, allEdges, visitedNodeIds + currentNode, visitedEdges + edge)
            if (cycleOfChild.cycles.isNotEmpty()) {
                return cycleOfChild
            }
        }
        return CycleResult(cycles = listOf(), visitedNodeIds = visitedNodeIds)
    }

    private fun normalizeCycle(cycle: List<NumberEdge>): List<NumberEdge> {
        val minIndex = cycle.indices.minBy { cycle[it].from }
        return (cycle.subList(minIndex, cycle.size) + cycle.subList(0, minIndex))
    }

    private fun filterDuplicates(cycles: Collection<List<NumberEdge>>): List<List<NumberEdge>> {
        val seen = mutableSetOf<Int>()
        val result = mutableListOf<List<NumberEdge>>()
        for (cycle in cycles) {
            val normalized = normalizeCycle(cycle)
            val hash = normalized.hashCode()
            if (seen.add(hash)) {
                result.add(cycle)
            }
        }
        return result
    }

    data class CycleResult(val visitedNodeIds: Set<Int>, val cycles: List<List<NumberEdge>>)
}
