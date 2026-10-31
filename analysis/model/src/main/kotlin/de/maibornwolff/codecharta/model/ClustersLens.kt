package de.maibornwolff.codecharta.model

import de.maibornwolff.codecharta.util.Logger

// Members reference node ids, so a filter that re-paths the tree has to re-key the lens along with it, see [rekeyed]
data class ClustersLens(val clusterings: Map<String, Clustering> = emptyMap()) : Lens {
    val carriesData: Boolean get() = clusterings.values.any { it.clusters.isNotEmpty() }

    private val memberCount: Int get() = clusterings.values.sumOf { clustering -> clustering.clusters.sumOf { it.members.size } }

    fun merge(other: ClustersLens): ClustersLens = ClustersLens(
        mergeByKey(clusterings, other.clusterings) { clusteringKey, existing, incoming -> existing.merge(incoming, clusteringKey) }
    )

    fun rekeyed(treeBeforeRestructuring: Node, treeAfterRestructuring: Node, remapSegments: SegmentRemapping): ClustersLens {
        if (!carriesData) return this
        val newIdByOldId = nodeIdRemapping(treeBeforeRestructuring, treeAfterRestructuring, remapSegments)
        return withMembersMappedBy { newIdByOldId[it] }
    }

    fun keepingMembersOf(nodeIds: Set<String>): ClustersLens = withMembersMappedBy { nodeId -> nodeId.takeIf { it in nodeIds } }

    fun droppingUnresolvedMembers(nodeIds: Set<String>): ClustersLens {
        val resolved = keepingMembersOf(nodeIds)
        val droppedCount = memberCount - resolved.memberCount
        if (droppedCount > 0) Logger.warn { "Dropping $droppedCount cluster member(s) with an unresolved node id." }
        return resolved
    }

    private fun withMembersMappedBy(newIdOf: (String) -> String?): ClustersLens = ClustersLens(
        clusterings
            .mapValues { (_, clustering) -> clustering.withMembersMappedBy(newIdOf) }
            .filterValues { it.clusters.isNotEmpty() }
    )
}

enum class ClusterMembership(val wireName: String) {
    PARTITION("partition"),
    WEIGHTED("weighted"),
    OVERLAY("overlay");

    companion object {
        fun fromWireName(wireName: String?): ClusterMembership? = entries.firstOrNull { it.wireName == wireName }
    }
}

data class Clustering(
    val title: String,
    val membership: ClusterMembership,
    val analyzers: List<String>,
    val clusters: List<Cluster>,
    val weightBasis: String? = null,
    val attributeTypes: Map<String, AttributeType> = emptyMap(),
    val attributeDescriptors: Map<String, AttributeDescriptor> = emptyMap()
) {
    internal fun merge(other: Clustering, clusteringKey: String): Clustering {
        warnWhenDescribedDifferently(other, clusteringKey)
        return copy(
            analyzers = (analyzers + other.analyzers).distinct(),
            clusters = mergeClusters(other.clusters, clusteringKey),
            weightBasis = weightBasis ?: other.weightBasis,
            attributeTypes = mergeAttributeTypes(attributeTypes, other.attributeTypes),
            attributeDescriptors = mergeAttributeDescriptors(attributeDescriptors, other.attributeDescriptors)
        )
    }

    private fun warnWhenDescribedDifferently(other: Clustering, clusteringKey: String) {
        val differs =
            membership != other.membership || (weightBasis != null && other.weightBasis != null && weightBasis != other.weightBasis)
        if (differs) Logger.warn { "Two inputs describe the clustering '$clusteringKey' differently; keeping the first description." }
    }

    private fun mergeClusters(otherClusters: List<Cluster>, clusteringKey: String): List<Cluster> {
        val merged = LinkedHashMap<String, Cluster>()
        (clusters + otherClusters).forEach { cluster ->
            merged[cluster.id] = merged[cluster.id]?.merge(cluster, clusteringKey) ?: cluster
        }
        return merged.values.toList()
    }

    // A cluster the mapping emptied goes with its members, unless a surviving cluster still hangs below it
    internal fun withMembersMappedBy(newIdOf: (String) -> String?): Clustering {
        val mapped = clusters.map { it.withMembersMappedBy(newIdOf) }
        val parentById = mapped.associate { it.id to it.parentId }
        val inhabited = withAncestors(mapped.filter { it.members.isNotEmpty() }.map { it.id }) { parentById[it] }
        val surviving = mapped.zip(clusters).filter { (cluster, original) -> cluster.id in inhabited || original.members.isEmpty() }
        return copy(clusters = surviving.map { (cluster, _) -> cluster })
    }
}

data class Cluster(
    val id: String,
    val name: String,
    val members: List<ClusterMember>,
    val parentId: String? = null,
    val attributes: Map<String, Any> = emptyMap()
) {
    internal fun merge(other: Cluster, clusteringKey: String): Cluster {
        val mergedMembers = LinkedHashMap<String, ClusterMember>()
        (members + other.members).forEach { member ->
            val existing = mergedMembers.putIfAbsent(member.nodeId, member)
            if (existing != null && existing.effectiveWeight != member.effectiveWeight) {
                Logger.warn {
                    "Two inputs weigh node '${member.nodeId}' differently in cluster '$id' of '$clusteringKey' " +
                        "(${existing.effectiveWeight} and ${member.effectiveWeight}); keeping the first weight."
                }
            }
        }
        return copy(
            members = mergedMembers.values.toList(),
            parentId = parentId ?: other.parentId,
            attributes =
                other.attributes + attributes
        )
    }

    // Two old ids landing on one new id means a move onto an occupied path; the tree keeps one node, so one member stays
    internal fun withMembersMappedBy(newIdOf: (String) -> String?): Cluster = copy(
        members = members
            .mapNotNull { member -> newIdOf(member.nodeId)?.let { member.copy(nodeId = it) } }
            .distinctBy { it.nodeId }
    )
}

// A null weight is the wire's "omitted means 1"
data class ClusterMember(val nodeId: String, val weight: Double? = null) {
    val effectiveWeight: Double get() = weight ?: 1.0
}
