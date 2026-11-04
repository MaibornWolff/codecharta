package de.maibornwolff.codecharta.analysers.parsers.dependency.processing.levelization

import de.maibornwolff.codecharta.analysers.parsers.dependency.processing.cycledetection.CycleAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.dependency.processing.cycledetection.model.Edge
import de.maibornwolff.codecharta.analysers.parsers.dependency.processing.cycledetection.model.NodeInformation
import de.maibornwolff.codecharta.analysers.parsers.dependency.processing.levelization.model.GraphEdge
import de.maibornwolff.codecharta.analysers.parsers.dependency.processing.levelization.model.GraphNode
import de.maibornwolff.codecharta.analysers.parsers.dependency.progress.ConditionalProgressBar
import de.maibornwolff.codecharta.util.Logger

fun levelize(rootNodes: List<GraphNode>): List<GraphNode> {
    val rootNode = GraphNode("my_root_node_id", null, rootNodes, edges = rootNodes.flatMap { it.edges }.toSet())
    return calculateLevels(listOf(rootNode))[0].children
}

private fun calculateLevels(nodes: List<GraphNode>): List<GraphNode> {
    if (nodes.isEmpty()) {
        return listOf()
    }

    val conditionalProgressBar = ConditionalProgressBar(
        "Levelizing",
        nodes.size
    ) { nodes.size > 10000 }

    return conditionalProgressBar.use { step ->
        nodes.map { node ->
            val leveledGrandchildrenAndBelow = calculateLevels(node.children)
            if (node.children.isNotEmpty()) {
                Logger.debug { "Levelizing package ${node.id}" }
            }
            val updatedNode = node.copy(children = leveledGrandchildrenAndBelow)
            calculateLevelsOfChildren(updatedNode).apply { step() }
        }
    }
}

private fun calculateLevelsOfChildren(node: GraphNode): GraphNode {
    val transformProgressBar = ConditionalProgressBar(
        "Transforming edges of ${node.id}",
        node.edges.size
    ) { node.edges.size > 100000 }

    val directChildren = DirectChildren(node.children)
    val transformedEdges = transformProgressBar.use { step ->
        node.edges
            .parallelStream()
            .map { transformEdgeToDirectChildren(it, directChildren).apply { step() } }
            .toList()
            .filterNotNull()
            .filter { it.source != it.target }
    }

    val incomingEdgesPerNode = mutableMapOf<String, Int>()
    transformedEdges.forEach {
        incomingEdgesPerNode[it.target] = incomingEdgesPerNode.getOrDefault(it.target, 0) + it.weight
    }
    val uniqueTransformedEdges = transformedEdges.associateBy { it.id() }.values.toList()
    var tempEdges = uniqueTransformedEdges
    var finished = tempEdges.isEmpty()
    var acyclicEdges = listOf<GraphEdge>()
    val maxTempEdges = tempEdges.size
    var lastTempEdges = maxTempEdges
    val cycleBreakerProgressBar = ConditionalProgressBar(
        "Breaking cycles of ${node.id}",
        maxTempEdges
    ) { maxTempEdges > 5000 }

    cycleBreakerProgressBar.use { step ->
        while (!finished) {
            val newEdges = removeCycles(incomingEdgesPerNode, tempEdges)
            if (newEdges.size == tempEdges.size) {
                acyclicEdges = newEdges
                finished = true
            } else {
                repeat(lastTempEdges - newEdges.size) { step() }
                lastTempEdges = tempEdges.size
            }
            tempEdges = newEdges
        }
    }
    val groupedAcyclicEdges = acyclicEdges.groupBy { it.source }
    val distributedNodes = calculateLevelZeroNodes(node, groupedAcyclicEdges).toMutableList()
    val distributedNodeIds = distributedNodes.mapTo(HashSet()) { it.id }
    var undistributedNodes = node.children
        .filter { !distributedNodeIds.contains(it.id) }

    var currentLevel = 0
    while (undistributedNodes.isNotEmpty()) {
        val nextLevelNodes = calculateNextLevel(currentLevel, undistributedNodes, distributedNodes, groupedAcyclicEdges)
        distributedNodes.addAll(nextLevelNodes)

        val nextLevelNodeIds = nextLevelNodes.mapTo(HashSet()) { it.id }
        undistributedNodes = undistributedNodes.filter { !nextLevelNodeIds.contains(it.id) }
        currentLevel++
    }

    return node.copy(children = distributedNodes)
}

private fun calculateNextLevel(
    currentLevel: Int,
    undistributedNodes: List<GraphNode>,
    distributedNodes: List<GraphNode>,
    dependenciesPerNode: Map<String, List<GraphEdge>>
): List<GraphNode> {
    val allowedDependencyTargetsIds = distributedNodes.mapTo(HashSet()) { it.id }

    return undistributedNodes.flatMap { node ->
        val dependenciesForNode = dependenciesPerNode[node.id]
        if (dependenciesForNode.isNullOrEmpty()) {
            listOf()
        } else {
            val dependencyTargetIds = dependenciesForNode.map { dependency -> dependency.target }
            if (allowedDependencyTargetsIds.containsAll(dependencyTargetIds)) {
                val leveledNode = node.copy(level = currentLevel + 1)
                listOf(leveledNode)
            } else {
                listOf()
            }
        }
    }
}

private fun calculateLevelZeroNodes(node: GraphNode, edgesPerNode: Map<String, List<GraphEdge>>) = node.children
    .filter { child -> edgesPerNode[child.id].isNullOrEmpty() }
    .map { child -> child.copy(level = 0) }

private fun removeCycles(incomingEdgesPerNode: MutableMap<String, Int>, edges: List<GraphEdge>): List<GraphEdge> {
    if (edges.size < 2) {
        return edges
    }
    val nodeInformation = edges
        .groupBy { it.source }
        .map { edgesOfSource -> NodeInformation(edgesOfSource.key, edgesOfSource.value.map { it.target }.toSet()) }
        .toSet()
    val edgesToRemove = mutableSetOf<Edge<String>?>()
    val cycles = CycleAnalyzer.determineCycles(nodeInformation, singleCycle = true)
    cycles.forEach { cycle ->
        val cycleEdges = cycle.edges
        val nodesInCycle = cycle.edges.flatMap { edge -> listOf(edge.from, edge.to) }.toSet()
        val nodeWithLeastIncomingEdges = nodesInCycle
            .minByOrNull { node -> incomingEdgesPerNode.getOrDefault(node, -1) }
        edgesToRemove.add(cycleEdges.find { it.to == nodeWithLeastIncomingEdges })
    }
    return edges.filter { edge -> !edgesToRemove.contains(Edge(edge.source, edge.target)) }
}

private fun transformEdgeToDirectChildren(edge: GraphEdge, directChildren: DirectChildren): GraphEdge? {
    val target = directChildren.holding(edge.target) ?: return null
    val source = directChildren.holding(edge.source) ?: return null
    return edge.copy(source = source, target = target)
}

/**
 * The child of a node that an id belongs to: the child with that id, else the first child, in the order of the
 * children, whose id is an ancestor of it, as `a.b` of `a.b.C`. Looked up by the ancestors of the id instead of by
 * comparing every child, which a package with many children and edges cannot afford.
 */
private class DirectChildren(children: List<GraphNode>) {
    private val orderById = HashMap<String, Int>()

    init {
        children.forEachIndexed { order, child -> orderById.putIfAbsent(child.id, order) }
    }

    fun holding(id: String): String? {
        if (id in orderById) return id
        return ancestorIdsOf(id).filter { it in orderById }.minByOrNull { orderById.getValue(it) }
    }

    private fun ancestorIdsOf(id: String): List<String> {
        val separators = id.indices.filter { id[it] == ID_SEPARATOR }
        return separators.map { id.substring(0, it) }
    }

    companion object {
        private const val ID_SEPARATOR = '.'
    }
}
