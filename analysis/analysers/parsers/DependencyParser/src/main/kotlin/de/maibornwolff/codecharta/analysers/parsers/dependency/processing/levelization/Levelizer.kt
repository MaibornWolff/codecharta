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

    val transformedEdges = transformProgressBar.use { step ->
        node.edges
            .parallelStream()
            .map { transformEdgeToDirectChildren(it, node).apply { step() } }
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
    val distributedNodeIds = distributedNodes.map { it.id }
    var undistributedNodes = node.children
        .filter { !distributedNodeIds.contains(it.id) }

    var currentLevel = 0
    while (undistributedNodes.isNotEmpty()) {
        val nextLevelNodes = calculateNextLevel(currentLevel, undistributedNodes, distributedNodes, groupedAcyclicEdges)
        distributedNodes.addAll(nextLevelNodes)

        val nextLevelNodeIds = nextLevelNodes.map { it.id }
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
    val allowedDependencyTargetsIds = distributedNodes.map { it.id }

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
    val edgesToRemove = mutableSetOf<Edge?>()
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

private fun transformEdgeToDirectChildren(edge: GraphEdge, node: GraphNode): GraphEdge? {
    val directChildrenIds = node.children.map { it.id }
    val directTarget = directChildrenIds.find { edge.target == it }
    val directSource = directChildrenIds.find { edge.source == it }

    val target = directTarget ?: findMostSuitableChild(directChildrenIds, edge.target)
    val source = directSource ?: findMostSuitableChild(directChildrenIds, edge.source)
    if (target == null || source == null) {
        return null
    }
    return edge.copy(source = source, target = target)
}

private fun findMostSuitableChild(directChildrenIds: List<String>, id: String): String? {
    val nestedChildId = id.split(".")
    val childrenIdPaths = directChildrenIds.map { it.split(".") }
    val find = childrenIdPaths.find { directChildId ->
        directChildId.size < nestedChildId.size && nestedChildId.subList(0, directChildId.size) == directChildId
    }
    return find?.joinToString(".")
}
