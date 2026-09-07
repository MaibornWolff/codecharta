package de.maibornwolff.codecharta.analysers.parsers.dependency.processing.cycledetection

import de.maibornwolff.codecharta.analysers.parsers.dependency.processing.cycledetection.algorithms.DepthFirstSearchCycleDetection
import de.maibornwolff.codecharta.analysers.parsers.dependency.processing.cycledetection.algorithms.NumberEdge
import de.maibornwolff.codecharta.analysers.parsers.dependency.processing.cycledetection.algorithms.StronglyConnectedComponent
import de.maibornwolff.codecharta.analysers.parsers.dependency.processing.cycledetection.algorithms.StronglyConnectedComponentDetection
import de.maibornwolff.codecharta.analysers.parsers.dependency.processing.cycledetection.model.Cycle
import de.maibornwolff.codecharta.analysers.parsers.dependency.processing.cycledetection.model.Edge
import de.maibornwolff.codecharta.analysers.parsers.dependency.processing.cycledetection.model.NodeInformation
import de.maibornwolff.codecharta.util.Logger

class CycleAnalyzer {
    companion object {
        fun determineCycles(leaves: Set<NodeInformation>, singleCycle: Boolean = false): List<Cycle> {
            val stronglyConnectedComponentsWithCycles = StronglyConnectedComponentDetection()
                .run(leaves)
                .filter { it.nodes.size > 1 }
            if (stronglyConnectedComponentsWithCycles.isNotEmpty() && !singleCycle) {
                Logger.info { "Found ${stronglyConnectedComponentsWithCycles.size} strongly connected components" }
            }
            return stronglyConnectedComponentsWithCycles.flatMap { cycle ->
                findCycleInComponent(cycle, singleCycle)
            }
        }

        fun List<Cycle>.groupByLeafs() = this
            .flatMap { it.edges }
            .groupBy({ it.from }, { it.to })
            .mapValues { it.value.toSet() }

        private fun findCycleInComponent(cycle: StronglyConnectedComponent, singleCycle: Boolean): List<Cycle> {
            val nodes = cycle.nodes.toList()
            val nodeIdToNumber = nodes
                .mapIndexed { index, nodeInformationDto -> nodeInformationDto.id to index }
                .toMap()
            val edges = nodes.flatMapIndexed { fromNumber, node ->
                node.dependencies.mapNotNull { dependency ->
                    nodeIdToNumber[dependency]?.let { toNumber -> NumberEdge(fromNumber, toNumber) }
                }
            }

            val result = if (singleCycle) {
                DepthFirstSearchCycleDetection(edges, limitCycleLength = false).detectSingleCycle()
            } else {
                DepthFirstSearchCycleDetection(edges, limitCycleLength = true).detectAllCycles()
            }

            return result.map { Cycle(it.map { edge -> Edge(nodes[edge.from].id, nodes[edge.to].id) }) }
        }
    }
}
