package de.maibornwolff.codecharta.model

/**
 * The dependency graph of a project: its edges plus, per node, where the node sits in that graph.
 * [nodes] is keyed by node id, so a filter that re-paths the tree has to re-key the lens along with it —
 * see [rekeyed].
 */
data class DependencyLens(
    val edges: List<Edge> = emptyList(),
    val attributeTypes: Map<String, AttributeType> = emptyMap(),
    val attributeDescriptors: Map<String, AttributeDescriptor> = emptyMap(),
    val nodes: Map<String, DependencyNode> = emptyMap()
) : Lens {
    val carriesNodeData: Boolean get() = nodes.isNotEmpty()

    fun merge(other: DependencyLens): DependencyLens = DependencyLens(
        edges = mergeEdges(edges + other.edges),
        attributeTypes = mergeAttributeTypes(attributeTypes, other.attributeTypes),
        attributeDescriptors = mergeAttributeDescriptors(attributeDescriptors, other.attributeDescriptors),
        nodes = mergeNodes(other.nodes)
    )

    // Fold edges that share a directed endpoint pair into one, unioning their attributes instead of
    // dropping all but the first. The first edge wins on a conflicting key, matching the first-wins
    // rule the attribute-type and descriptor merges already use.
    private fun mergeEdges(allEdges: List<Edge>): List<Edge> = allEdges
        .groupBy { Pair(it.fromNodeName, it.toNodeName) }
        .map { (_, edgesForPair) -> edgesForPair.reduce(::unionAttributes) }

    // The graph flags OR rather than take the first edge's value: an edge one input found cyclic is
    // cyclic, the same rule that aggregates edges when a namespace collapses.
    private fun unionAttributes(first: Edge, second: Edge): Edge = Edge(
        first.fromNodeName,
        first.toNodeName,
        second.attributes + first.attributes,
        first.isCyclic || second.isCyclic,
        first.isPointingUpwards || second.isPointingUpwards
    )

    // A node both inputs levelized keeps the higher level, the way NodeMaxAttributeMerger reconciles a
    // metric two inputs measured. Levels are only meaningful within one producer's graph, so this is a
    // conservative reconciliation, not a recomputation — merging levelized projects and expecting exact
    // levels means re-running the parser on the merged tree.
    private fun mergeNodes(otherNodes: Map<String, DependencyNode>): Map<String, DependencyNode> {
        if (nodes.isEmpty()) return otherNodes
        if (otherNodes.isEmpty()) return nodes

        val merged = LinkedHashMap(nodes)
        otherNodes.forEach { (nodeId, node) ->
            val existing = merged[nodeId]
            merged[nodeId] = if (existing == null) node else existing.merge(node)
        }
        return merged
    }

    /** Re-key the per-node entries onto a restructured tree; see [nodeIdRemapping] for how ids are recovered. */
    fun rekeyed(treeBeforeRestructuring: Node, remapSegments: SegmentRemapping): DependencyLens {
        if (nodes.isEmpty()) return this
        return copy(nodes = nodes.rekeyedBy(nodeIdRemapping(treeBeforeRestructuring, remapSegments)))
    }
}

/**
 * One node's place in the dependency graph. An object rather than a bare level so per-node facts
 * (declaration kind, detected language) can be added later without a breaking change.
 */
data class DependencyNode(val level: Int) {
    fun merge(other: DependencyNode): DependencyNode = DependencyNode(maxOf(level, other.level))
}
