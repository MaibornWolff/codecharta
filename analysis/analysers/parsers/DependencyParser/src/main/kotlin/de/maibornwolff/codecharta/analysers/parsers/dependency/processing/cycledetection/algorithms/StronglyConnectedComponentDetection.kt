package de.maibornwolff.codecharta.analysers.parsers.dependency.processing.cycledetection.algorithms

import de.maibornwolff.codecharta.analysers.parsers.dependency.processing.cycledetection.model.NodeInformation

class StronglyConnectedComponentDetection {
    private var index = 0
    private val stack = mutableListOf<TarjanNode>()
    private val onStack = mutableSetOf<TarjanNode>()
    private val indexMap = mutableMapOf<TarjanNode, Int>()
    private val lowLinkMap = mutableMapOf<TarjanNode, Int>()
    private val sccs = mutableListOf<StronglyConnectedTarjanComponent>()

    fun run(nodeInformations: Set<NodeInformation>): List<StronglyConnectedComponent> {
        val tarjanNodes = convertToTarjanNodes(nodeInformations)
        return detectSCCs(tarjanNodes.values.toSet()).toDto(tarjanNodes, nodeInformations)
    }

    private fun convertToTarjanNodes(nodeInformations: Set<NodeInformation>): Map<String, TarjanNode> {
        val result = mutableMapOf<String, TarjanNode>()
        var nextNodeIndex = 0
        nodeInformations.forEach { node ->
            val tarjanNode = result.getOrPut(node.id) { TarjanNode(nextNodeIndex++) }
            node.dependencies.forEach { dependency ->
                tarjanNode.neighbors.add(result.getOrPut(dependency) { TarjanNode(nextNodeIndex++) })
            }
        }
        return result
    }

    private fun detectSCCs(nodes: Set<TarjanNode>): List<StronglyConnectedTarjanComponent> {
        nodes.forEach { node ->
            if (!indexMap.containsKey(node)) {
                strongConnect(node)
            }
        }
        return sccs
    }

    private fun strongConnect(node: TarjanNode) {
        val nodeIndex = index
        indexMap[node] = nodeIndex
        lowLinkMap[node] = nodeIndex
        index++
        stack.add(node)
        onStack.add(node)

        var lowLink = nodeIndex
        node.neighbors.forEach { successor ->
            val reachableIndex = lowestIndexReachableThrough(successor) ?: return@forEach
            lowLink = minOf(lowLink, reachableIndex)
            lowLinkMap[node] = lowLink
        }

        if (lowLink == nodeIndex) {
            val stronglyConnectedNodes = mutableSetOf<TarjanNode>()
            var poppedNode: TarjanNode
            do {
                poppedNode = stack.removeAt(stack.size - 1)
                onStack.remove(poppedNode)
                stronglyConnectedNodes.add(poppedNode)
            } while (poppedNode != node)
            sccs.add(StronglyConnectedTarjanComponent(stronglyConnectedNodes))
        }
    }

    // Null when the successor belongs to an already completed component: it cannot lower this node's low link.
    private fun lowestIndexReachableThrough(successor: TarjanNode): Int? {
        if (!indexMap.containsKey(successor)) {
            strongConnect(successor)
            return lowLinkMap[successor]
        }
        return if (onStack.contains(successor)) indexMap[successor] else null
    }
}

class TarjanNode(val id: Int, val neighbors: MutableSet<TarjanNode> = mutableSetOf()) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as TarjanNode

        return id == other.id
    }

    override fun hashCode(): Int = id
}

fun List<StronglyConnectedTarjanComponent>.toDto(
    map: Map<String, TarjanNode>,
    nodeInformations: Set<NodeInformation>
): List<StronglyConnectedComponent> = map { it.toDto(map, nodeInformations) }

data class StronglyConnectedTarjanComponent(val nodes: Set<TarjanNode>) {
    fun toDto(map: Map<String, TarjanNode>, nodeInformations: Set<NodeInformation>) = StronglyConnectedComponent(
        nodes
            .mapNotNull { tarjanNode -> map.entries.find { it.value == tarjanNode } }
            .mapNotNull { tarjanNode -> nodeInformations.find { it.id == tarjanNode.key } }
            .toSet()
    )
}

data class StronglyConnectedComponent(val nodes: Set<NodeInformation>)
