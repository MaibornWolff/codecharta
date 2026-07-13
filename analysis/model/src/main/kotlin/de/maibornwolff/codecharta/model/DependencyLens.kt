package de.maibornwolff.codecharta.model

data class DependencyLens(
    val edges: List<Edge> = emptyList(),
    val attributeTypes: Map<String, AttributeType> = emptyMap(),
    val attributeDescriptors: Map<String, AttributeDescriptor> = emptyMap()
) : Lens {
    fun merge(other: DependencyLens): DependencyLens = DependencyLens(
        edges = (edges + other.edges).distinctBy { listOf(it.fromNodeName, it.toNodeName) },
        attributeTypes = mergeAttributeTypes(attributeTypes, other.attributeTypes),
        attributeDescriptors = mergeAttributeDescriptors(attributeDescriptors, other.attributeDescriptors)
    )
}
