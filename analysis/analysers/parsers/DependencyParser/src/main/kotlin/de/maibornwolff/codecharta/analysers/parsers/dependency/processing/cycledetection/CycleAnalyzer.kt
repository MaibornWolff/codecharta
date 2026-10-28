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
        fun <K> determineCycles(leaves: Set<NodeInformation<K>>): List<Cycle<K>> = componentsWithCycles(leaves)
            .flatMap { findCycleInComponent(it) }

        /** The targets of each node that lie on a cycle with it: an edge does exactly when both ends share a component. */
        fun <K> cyclicTargetsByNode(leaves: Set<NodeInformation<K>>): Map<K, Set<K>> {
            val stronglyConnectedComponentsWithCycles = componentsWithCycles(leaves)
            Logger.info { "Found ${stronglyConnectedComponentsWithCycles.size} strongly connected components" }
            return stronglyConnectedComponentsWithCycles
                .flatMap { component ->
                    val componentIds = component.nodes.map { it.id }.toSet()
                    component.nodes.map { node -> node.id to node.dependencies.intersect(componentIds) }
                }.toMap()
        }

        private fun <K> componentsWithCycles(leaves: Set<NodeInformation<K>>) = StronglyConnectedComponentDetection()
            .run(leaves)
            .filter { it.nodes.size > 1 }

        private fun <K> findCycleInComponent(cycle: StronglyConnectedComponent<K>): List<Cycle<K>> {
            val nodes = cycle.nodes.toList()
            val nodeIdToNumber = nodes
                .mapIndexed { index, nodeInformationDto -> nodeInformationDto.id to index }
                .toMap()
            val edges = nodes.flatMapIndexed { fromNumber, node ->
                node.dependencies.mapNotNull { dependency ->
                    nodeIdToNumber[dependency]?.let { toNumber -> NumberEdge(fromNumber, toNumber) }
                }
            }

            val result = DepthFirstSearchCycleDetection(edges).detectSingleCycle()

            return result.map { Cycle(it.map { edge -> Edge(nodes[edge.from].id, nodes[edge.to].id) }) }
        }
    }
}
