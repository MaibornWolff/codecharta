package de.maibornwolff.codecharta.model

import de.maibornwolff.codecharta.util.Logger

/**
 * The dependency graph of a project in both of its projections.
 *
 * The physical projection is [edges] between file nodes plus, per node, where the node sits in that
 * graph ([nodes]); it is keyed by node id, so a filter that re-paths the tree has to re-key the lens
 * along with it — see [rekeyed]. The logical projection is the graph as the code declares it: [leaves]
 * are the declarations, [namespaces] the packages containing them, and [leafEdges] the dependencies
 * between declarations. Its tables are keyed by dotted logical path, which no filter moves; only
 * [DependencyLeaf.nodeId], the join back onto the file tree, is re-keyed.
 */
data class DependencyLens(
    val edges: List<Edge> = emptyList(),
    val attributeTypes: Map<String, AttributeType> = emptyMap(),
    val attributeDescriptors: Map<String, AttributeDescriptor> = emptyMap(),
    val nodes: Map<String, DependencyNode> = emptyMap(),
    val namespaces: Map<String, DependencyNamespace> = emptyMap(),
    val leaves: Map<String, DependencyLeaf> = emptyMap(),
    val leafEdges: List<LeafEdge> = emptyList()
) : Lens {
    val carriesNodeData: Boolean get() = nodes.isNotEmpty() || leaves.isNotEmpty()

    fun merge(other: DependencyLens): DependencyLens = DependencyLens(
        edges = mergeEdges(edges + other.edges),
        attributeTypes = mergeAttributeTypes(attributeTypes, other.attributeTypes),
        attributeDescriptors = mergeAttributeDescriptors(attributeDescriptors, other.attributeDescriptors),
        nodes = mergeNodes(other.nodes),
        namespaces = mergeNamespaces(other.namespaces),
        leaves = mergeLeaves(other.leaves),
        leafEdges = mergeLeafEdges(leafEdges + other.leafEdges)
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
    private fun mergeNodes(otherNodes: Map<String, DependencyNode>): Map<String, DependencyNode> =
        mergeByKey(nodes, otherNodes) { _, existing, incoming -> existing.merge(incoming) }

    private fun mergeNamespaces(otherNamespaces: Map<String, DependencyNamespace>): Map<String, DependencyNamespace> =
        mergeByKey(namespaces, otherNamespaces) { _, existing, incoming -> existing.merge(incoming) }

    // A leaf describes where a declaration lives, not a measurement of it, so there is nothing to
    // reconcile: the first description wins and the conflict is reported, the way CcJsonV2ToProjectMapper
    // handles two file nodes claiming one id.
    private fun mergeLeaves(otherLeaves: Map<String, DependencyLeaf>): Map<String, DependencyLeaf> =
        mergeByKey(leaves, otherLeaves) { leafId, existing, incoming ->
            if (existing != incoming) {
                Logger.warn {
                    "Two inputs describe the leaf '$leafId' differently (node ids ${existing.nodeId} and ${incoming.nodeId}); " +
                        "keeping the first and ignoring the second."
                }
            }
            existing
        }

    private fun <T> mergeByKey(own: Map<String, T>, other: Map<String, T>, reconcile: (String, T, T) -> T): Map<String, T> {
        if (own.isEmpty()) return other
        if (other.isEmpty()) return own

        val merged = LinkedHashMap(own)
        other.forEach { (key, entry) ->
            val existing = merged[key]
            merged[key] = if (existing == null) entry else reconcile(key, existing, entry)
        }
        return merged
    }

    private fun mergeLeafEdges(allLeafEdges: List<LeafEdge>): List<LeafEdge> = allLeafEdges
        .groupBy { Pair(it.fromLeaf, it.toLeaf) }
        .map { (_, edgesForPair) -> edgesForPair.reduce(LeafEdge::merge) }

    /**
     * Re-key the entries that address a file node onto a restructured tree; see [nodeIdRemapping] for how
     * ids are recovered. A leaf keeps its logical key — a restructuring moves files, not packages — and
     * only follows its file; one whose file did not survive has nothing left to join onto, so it goes,
     * and with it every leaf edge that touched it and every namespace no surviving leaf lives in.
     */
    fun rekeyed(treeBeforeRestructuring: Node, treeAfterRestructuring: Node, remapSegments: SegmentRemapping): DependencyLens {
        if (!carriesNodeData) return this
        val newIdByOldId = nodeIdRemapping(treeBeforeRestructuring, treeAfterRestructuring, remapSegments)
        val rekeyedLeaves = leaves
            .mapNotNull { (leafId, leaf) ->
                newIdByOldId[leaf.nodeId]?.let { newNodeId -> leafId to leaf.copy(nodeId = newNodeId) }
            }.toMap()
        val inhabitedNamespaces = namespacesOf(rekeyedLeaves.keys)
        return copy(
            nodes = nodes.rekeyedBy(newIdByOldId),
            namespaces = namespaces.filterKeys { leaves.isEmpty() || it in inhabitedNamespaces },
            leaves = rekeyedLeaves,
            leafEdges = leafEdges.filter { leaves.isEmpty() || (it.fromLeaf in rekeyedLeaves && it.toLeaf in rekeyedLeaves) }
        )
    }

    // With dotted ids the namespaces a leaf lives in are every proper prefix of its id, split on the dots.
    private fun namespacesOf(leafIds: Collection<String>): Set<String> = leafIds
        .flatMapTo(HashSet()) { leafId ->
            val segments = leafId.split('.')
            (1 until segments.size).map { depth -> segments.take(depth).joinToString(".") }
        }
}

/**
 * One node's place in the dependency graph. An object rather than a bare level so per-node facts
 * (declaration kind, detected language) can be added later without a breaking change.
 */
data class DependencyNode(val level: Int) {
    fun merge(other: DependencyNode): DependencyNode = DependencyNode(maxOf(level, other.level))
}

/**
 * One package's place in the logical dependency graph, keyed by its dotted logical path. It needs no
 * parent: with dotted ids the parent is the id's prefix.
 */
data class DependencyNamespace(val level: Int) {
    fun merge(other: DependencyNamespace): DependencyNamespace = DependencyNamespace(maxOf(level, other.level))
}

/**
 * One declaration — a class, interface, function, … — as the logical layer sees it, keyed by its dotted
 * logical path. [nodeId] is the id of the file node the declaration lives in, and the only join from the
 * logical layer back onto the file tree. [name] is kept rather than derived from the key because the
 * logical path escapes dots inside a segment and that escaping is not reversible. [level] is absent when
 * the producer skipped levelization.
 */
data class DependencyLeaf(val nodeId: String, val name: String, val kind: String, val level: Int? = null)

/**
 * A dependency between two declarations. A list of its own rather than a widened [Edge], because [Edge]
 * addresses file nodes by id and is what the edge-metric machinery, `edgefilter` and the 3D map read.
 *
 * [usage] carries every way the source declaration uses the target (inheritance, instantiation, …), so
 * folding two edges of one pair unions the ways rather than picking one.
 */
data class LeafEdge(
    val fromLeaf: String,
    val toLeaf: String,
    val attributes: Map<String, Any> = emptyMap(),
    val usage: List<String> = emptyList(),
    val isCyclic: Boolean = false,
    val isPointingUpwards: Boolean = false
) {
    // Attributes fold the way [Edge]s do in [DependencyLens.merge]: the first edge's value wins on a
    // conflicting key. Two inputs carrying the same pair describe the same references, not disjoint ones,
    // so adding the weights would double-count a project merged with itself, and the physical projection
    // of the same dependency would disagree with the logical one.
    fun merge(other: LeafEdge): LeafEdge = LeafEdge(
        fromLeaf = fromLeaf,
        toLeaf = toLeaf,
        attributes = other.attributes + attributes,
        usage = (usage + other.usage).distinct(),
        isCyclic = isCyclic || other.isCyclic,
        isPointingUpwards = isPointingUpwards || other.isPointingUpwards
    )
}
