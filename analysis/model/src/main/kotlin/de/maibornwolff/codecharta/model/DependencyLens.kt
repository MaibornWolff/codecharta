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
     * Merges [other] in. Edges from both lenses are concatenated and de-duplicated by endpoint pair, so
     * overlaying a dependency-bearing lens never drops either side's edges.
     */
    fun merge(other: DependencyLens): DependencyLens = DependencyLens(
        edges = (edges + other.edges).distinctBy { listOf(it.fromNodeName, it.toNodeName) },
        attributeTypes = mergeAttributeTypes(attributeTypes, other.attributeTypes),
        attributeDescriptors = mergeAttributeDescriptors(attributeDescriptors, other.attributeDescriptors)
    )
}
