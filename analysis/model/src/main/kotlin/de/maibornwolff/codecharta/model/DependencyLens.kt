package de.maibornwolff.codecharta.model

import de.maibornwolff.codecharta.util.Logger

/**
 * The dependency graph of a project in both of its projections: the physical one between file nodes
 * ([edges], [nodes]) and the logical one the code declares ([namespaces], [leaves], [leafEdges]).
 * Everything but [edges] and [namespaces] is keyed by node id, so a filter that re-paths the tree has to
 * re-key the lens along with it — see [rekeyed].
 */
data class DependencyLens(
    val edges: List<Edge> = emptyList(),
    val attributeTypes: Map<String, AttributeType> = emptyMap(),
    val attributeDescriptors: Map<String, AttributeDescriptor> = emptyMap(),
    val nodes: Map<String, DependencyNode> = emptyMap(),
    val namespaces: Map<String, DependencyNamespace> = emptyMap(),
    val leaves: Map<String, Map<String, DependencyLeaf>> = emptyMap(),
    val leafEdges: List<LeafEdge> = emptyList()
) : Lens {
    val carriesNodeData: Boolean get() = nodes.isNotEmpty() || leaves.isNotEmpty() || leafEdges.isNotEmpty()

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

    // Two inputs declaring one key in one file describe the same declaration: the first description wins,
    // the way CcJsonV2ToProjectMapper handles two file nodes claiming one id.
    private fun mergeLeaves(otherLeaves: Map<String, Map<String, DependencyLeaf>>): Map<String, Map<String, DependencyLeaf>> =
        mergeByKey(leaves, otherLeaves) { nodeId, existingLeaves, incomingLeaves ->
            mergeByKey(existingLeaves, incomingLeaves) { leafKey, existing, incoming ->
                if (existing != incoming) {
                    Logger.warn {
                        "Two inputs describe the leaf '$leafKey' of node '$nodeId' differently ($existing and $incoming); " +
                            "keeping the first description."
                    }
                }
                existing
            }
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
        .groupBy { listOf(it.fromId, it.fromLeaf, it.toId, it.toLeaf) }
        .map { (_, edgesForEndpoints) -> edgesForEndpoints.reduce(LeafEdge::merge) }

    /**
     * Re-key the entries that address a file node onto a restructured tree; see [nodeIdRemapping] for how
     * ids are recovered. The leaves of a file that did not survive go with it, and with them every leaf
     * edge that touched them and every namespace no surviving leaf lives in.
     */
    fun rekeyed(treeBeforeRestructuring: Node, treeAfterRestructuring: Node, remapSegments: SegmentRemapping): DependencyLens {
        if (!carriesNodeData) return this
        val newIdByOldId = nodeIdRemapping(treeBeforeRestructuring, treeAfterRestructuring, remapSegments)
        val rekeyedNodes = nodes.rekeyedBy(newIdByOldId)
        val rekeyedLeafEdges = leafEdges.mapNotNull { it.rekeyedBy(newIdByOldId) }
        if (leaves.isEmpty()) return copy(nodes = rekeyedNodes, leafEdges = rekeyedLeafEdges)

        val rekeyedLeaves = leaves.rekeyedBy(newIdByOldId)
        val inhabitedNamespaces = inhabitedNamespaces(rekeyedLeaves)
        return copy(
            nodes = rekeyedNodes,
            namespaces = namespaces.filterKeys { it in inhabitedNamespaces },
            leaves = rekeyedLeaves,
            leafEdges = rekeyedLeafEdges.filter { it.joinsOnto(rekeyedLeaves) }
        )
    }

    private fun inhabitedNamespaces(survivingLeaves: Map<String, Map<String, DependencyLeaf>>): Set<String> =
        withAncestors(survivingLeaves.values.flatMap { it.values }.mapNotNull { it.namespace }) { namespaces[it]?.parent }

    /**
     * Prefixes every namespace key with [segment], the way `merge --large` prefixes the file paths with the
     * folder a project is wrapped in: two inputs declaring the same package must stay apart in the logical
     * projection as they do in the physical one.
     */
    fun underNamespace(segment: String): DependencyLens {
        fun prefixed(namespaceKey: String) = "$segment$NAMESPACE_SEPARATOR$namespaceKey"
        return copy(
            namespaces =
                namespaces.entries.associate { (namespaceKey, namespace) ->
                    prefixed(namespaceKey) to namespace.copy(parent = namespace.parent?.let(::prefixed))
                },
            leaves =
                leaves.mapValues { (_, leavesOfFile) ->
                    leavesOfFile.mapValues { (_, leaf) -> leaf.copy(namespace = leaf.namespace?.let(::prefixed)) }
                }
        )
    }

    companion object {
        private const val NAMESPACE_SEPARATOR = "."
    }
}

/**
 * One node's place in the dependency graph. An object rather than a bare level so per-node facts
 * (declaration kind, detected language) can be added later without a breaking change.
 */
data class DependencyNode(val level: Int) {
    fun merge(other: DependencyNode): DependencyNode = DependencyNode(maxOf(level, other.level))
}

data class DependencyNamespace(val level: Int, val parent: String? = null) {
    fun merge(other: DependencyNamespace): DependencyNamespace = copy(level = maxOf(level, other.level), parent = parent ?: other.parent)
}

data class DependencyLeaf(
    val kind: String,
    val name: String? = null,
    val language: String? = null,
    val namespace: String? = null,
    val parent: String? = null,
    val level: Int? = null
)

/**
 * A dependency between two declarations. A list of its own rather than a widened [Edge], because [Edge]
 * is what the edge-metric machinery, `edgefilter` and the 3D map read.
 */
data class LeafEdge(
    val fromId: String,
    val fromLeaf: String,
    val toId: String,
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
    fun merge(other: LeafEdge): LeafEdge = copy(
        attributes = other.attributes + attributes,
        usage = (usage + other.usage).distinct(),
        isCyclic = isCyclic || other.isCyclic,
        isPointingUpwards = isPointingUpwards || other.isPointingUpwards
    )

    fun joinsOnto(leaves: Map<String, Map<String, DependencyLeaf>>): Boolean =
        leaves[fromId]?.containsKey(fromLeaf) == true && leaves[toId]?.containsKey(toLeaf) == true

    internal fun rekeyedBy(newIdByOldId: Map<String, String>): LeafEdge? {
        val newFromId = newIdByOldId[fromId] ?: return null
        val newToId = newIdByOldId[toId] ?: return null
        return copy(fromId = newFromId, toId = newToId)
    }
}

/** [keys] and everything reached from them by following [parentOf]; a cyclic chain ends where it closes. */
fun withAncestors(keys: Iterable<String>, parentOf: (String) -> String?): Set<String> {
    val reached = HashSet<String>()
    keys.forEach { key ->
        var current: String? = key
        while (current != null && reached.add(current)) {
            current = parentOf(current)
        }
    }
    return reached
}
