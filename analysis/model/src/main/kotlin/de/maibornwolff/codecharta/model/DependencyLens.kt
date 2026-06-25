package de.maibornwolff.codecharta.model

/**
 * The dependency overlay: edges between nodes (referenced by [NodeId] on the wire, by path string in
 * memory) plus the edge `attributeTypes`/`attributeDescriptors` that used to sit under
 * `attributeTypes["edges"]`.
 */
data class DependencyLens(
    val edges: List<Edge> = emptyList(),
    val attributeTypes: Map<String, AttributeType> = emptyMap(),
    val attributeDescriptors: Map<String, AttributeDescriptor> = emptyMap()
) : Lens {
    /**
     * Merges [other] in. Edges are concatenated and de-duplicated by endpoint pair only when
     * [mergeEdges] is set (the recursive strategy); otherwise this lens keeps its own edges.
     */
    fun merge(other: DependencyLens, mergeEdges: Boolean): DependencyLens = DependencyLens(
        edges = if (mergeEdges) (edges + other.edges).distinctBy { listOf(it.fromNodeName, it.toNodeName) } else edges,
        attributeTypes = mergeAttributeTypes(attributeTypes, other.attributeTypes),
        attributeDescriptors = mergeAttributeDescriptors(attributeDescriptors, other.attributeDescriptors)
    )
}
