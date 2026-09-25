package de.maibornwolff.codecharta.analysers.parsers.dependency.processing.cycledetection.algorithms

data class NumberEdge(val from: Int, var to: Int)

class DepthFirstSearchCycleDetection(private val edges: List<NumberEdge>, private val limitCycleLength: Boolean) {
    private val processedNodes = mutableSetOf<Int>()
    private var maxCycleLength = Int.MAX_VALUE

    fun detectSingleCycle(): Set<List<NumberEdge>> {
        val nodes = edges.flatMap { listOf(it.from, it.to) }.toSet()
        if (limitCycleLength) {
            maxCycleLength = getMaxCycleLength(edges.size)
        }
        val edgeLookup = edges.groupBy { it.from }.toMap()
        val cycles = nodes.flatMap {
            if (processedNodes.contains(it)) {
                listOf()
            } else {
                val (processedNodeIds, cycles) = this.getCycles(it, it, edgeLookup, setOf(), listOf(), this::singleCycleResult)
                processedNodes.addAll(processedNodeIds)
                cycles
            }
        }
        return filterDuplicates(cycles).toSet()
    }

    fun detectAllCycles(): Set<List<NumberEdge>> {
        val nodes = edges.flatMap { listOf(it.from, it.to) }.toSet()
        if (limitCycleLength) {
            maxCycleLength = getMaxCycleLength(edges.size)
        }
        val edgeLookup = edges.groupBy { it.from }.toMap()
        val cycles = nodes.flatMap {
            if (processedNodes.contains(it)) {
                setOf()
            } else {
                val (processedNodeIds, cycles) = this.getCycles(it, it, edgeLookup, setOf(), listOf(), this::allCycleResults)
                processedNodes.addAll(processedNodeIds)
                cycles.toSet()
            }
        }
        return filterDuplicates(cycles).toSet()
    }

    private fun getMaxCycleLength(numberOfEdges: Int): Int = when {
        numberOfEdges < 100 -> 10
        numberOfEdges < 200 -> 8
        numberOfEdges < 400 -> 6
        else -> 4
    }

    private fun getCycles(
        startNode: Int,
        currentNode: Int,
        allEdges: Map<Int, List<NumberEdge>>,
        visitedNodeIds: Set<Int>,
        visitedEdges: List<NumberEdge>,
        recursiveFunction: (List<NumberEdge>, Int, Map<Int, List<NumberEdge>>, Set<Int>, Int, List<NumberEdge>) -> List<CycleResult>
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
        if (visitedEdges.size >= maxCycleLength) {
            return CycleResult(cycles = listOf(), visitedNodeIds = visitedNodeIds)
        }
        val outgoingEdges = allEdges[currentNode] ?: emptyList()
        if (outgoingEdges.isEmpty()) {
            return CycleResult(cycles = listOf(), visitedNodeIds = visitedNodeIds)
        }
        val results = recursiveFunction(outgoingEdges, startNode, allEdges, visitedNodeIds, currentNode, visitedEdges)
        return CycleResult(
            visitedNodeIds = results.flatMap { it.visitedNodeIds }.toSet(),
            cycles = results.flatMap { it.cycles }
        )
    }

    private fun allCycleResults(
        outgoingEdges: List<NumberEdge>,
        startNode: Int,
        allEdges: Map<Int, List<NumberEdge>>,
        visitedNodeIds: Set<Int>,
        currentNode: Int,
        visitedEdges: List<NumberEdge>
    ): List<CycleResult> = outgoingEdges.map { edge ->
        getCycles(
            startNode,
            edge.to,
            allEdges,
            visitedNodeIds + currentNode,
            visitedEdges + edge,
            this@DepthFirstSearchCycleDetection::allCycleResults
        )
    }

    private fun singleCycleResult(
        outgoingEdges: List<NumberEdge>,
        startNode: Int,
        allEdges: Map<Int, List<NumberEdge>>,
        visitedNodeIds: Set<Int>,
        currentNode: Int,
        visitedEdges: List<NumberEdge>
    ): List<CycleResult> {
        outgoingEdges.forEach { edge ->
            val cycleOfChild = this.getCycles(
                startNode,
                edge.to,
                allEdges,
                visitedNodeIds + currentNode,
                visitedEdges + edge,
                this::singleCycleResult
            )
            if (cycleOfChild.cycles.isNotEmpty()) {
                return listOf(cycleOfChild)
            }
        }
        return listOf(CycleResult(cycles = listOf(), visitedNodeIds = visitedNodeIds))
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
