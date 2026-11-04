package de.maibornwolff.codecharta.analysers.parsers.dependency.processing.cycledetection.algorithms

import de.maibornwolff.codecharta.analysers.parsers.dependency.processing.cycledetection.model.NodeInformation

class StronglyConnectedComponentDetection {
    private var index = 0
    private val stack = mutableListOf<TarjanNode>()
    private val onStack = mutableSetOf<TarjanNode>()
    private val indexMap = mutableMapOf<TarjanNode, Int>()
    private val lowLinkMap = mutableMapOf<TarjanNode, Int>()
    private val sccs = mutableListOf<StronglyConnectedTarjanComponent>()

    fun <K> run(nodeInformations: Set<NodeInformation<K>>): List<StronglyConnectedComponent<K>> {
        val tarjanNodes = convertToTarjanNodes(nodeInformations)
        return detectSCCs(tarjanNodes.values.toSet()).toDto(tarjanNodes, nodeInformations)
    }

    private fun <K> convertToTarjanNodes(nodeInformations: Set<NodeInformation<K>>): Map<K, TarjanNode> {
        val result = mutableMapOf<K, TarjanNode>()
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

    // On a stack of its own instead of recursing per successor, so a long chain cannot overflow the call stack
    private fun strongConnect(root: TarjanNode) {
        val frames = ArrayDeque<TarjanFrame>()
        frames.addLast(enter(root))
        while (frames.isNotEmpty()) {
            val frame = frames.last()
            val successor = frame.nextNeighbor()
            when {
                successor == null -> finish(frames.removeLast(), frames.lastOrNull())
                !indexMap.containsKey(successor) -> frames.addLast(enter(successor))
                onStack.contains(successor) -> frame.lowerLowLink(indexMap.getValue(successor))
            }
        }
    }

    private fun enter(node: TarjanNode): TarjanFrame {
        val nodeIndex = index++
        indexMap[node] = nodeIndex
        lowLinkMap[node] = nodeIndex
        stack.add(node)
        onStack.add(node)
        return TarjanFrame(node, nodeIndex)
    }

    private fun finish(frame: TarjanFrame, caller: TarjanFrame?) {
        lowLinkMap[frame.node] = frame.lowLink
        caller?.lowerLowLink(frame.lowLink)
        if (frame.lowLink == frame.index) sccs.add(StronglyConnectedTarjanComponent(popComponentOf(frame.node)))
    }

    private fun popComponentOf(node: TarjanNode): Set<TarjanNode> {
        val stronglyConnectedNodes = mutableSetOf<TarjanNode>()
        var poppedNode: TarjanNode
        do {
            poppedNode = stack.removeAt(stack.size - 1)
            onStack.remove(poppedNode)
            stronglyConnectedNodes.add(poppedNode)
        } while (poppedNode != node)
        return stronglyConnectedNodes
    }

    private class TarjanFrame(val node: TarjanNode, val index: Int) {
        private val neighbors = node.neighbors.iterator()
        var lowLink = index
            private set

        fun nextNeighbor(): TarjanNode? = if (neighbors.hasNext()) neighbors.next() else null

        fun lowerLowLink(reachableIndex: Int) {
            lowLink = minOf(lowLink, reachableIndex)
        }
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

fun <K> List<StronglyConnectedTarjanComponent>.toDto(
    map: Map<K, TarjanNode>,
    nodeInformations: Set<NodeInformation<K>>
): List<StronglyConnectedComponent<K>> {
    val idByTarjanNode = map.entries.associate { (id, tarjanNode) -> tarjanNode to id }
    val nodeInformationById = HashMap<K, NodeInformation<K>>()
    nodeInformations.forEach { nodeInformation -> nodeInformationById.putIfAbsent(nodeInformation.id, nodeInformation) }
    return map { it.toDto(idByTarjanNode, nodeInformationById) }
}

data class StronglyConnectedTarjanComponent(val nodes: Set<TarjanNode>) {
    fun <K> toDto(idByTarjanNode: Map<TarjanNode, K>, nodeInformationById: Map<K, NodeInformation<K>>) = StronglyConnectedComponent(
        nodes
            .mapNotNull { tarjanNode -> idByTarjanNode[tarjanNode] }
            .mapNotNull { id -> nodeInformationById[id] }
            .toSet()
    )
}

data class StronglyConnectedComponent<K>(val nodes: Set<NodeInformation<K>>)
