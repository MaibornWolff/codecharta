package de.maibornwolff.codecharta.model

data class DependencyLens(
    val edges: List<Edge> = emptyList(),
    val attributeTypes: Map<String, AttributeType> = emptyMap(),
    val attributeDescriptors: Map<String, AttributeDescriptor> = emptyMap()
) : Lens {
    fun merge(other: DependencyLens): DependencyLens = DependencyLens(
        edges = mergeEdges(edges + other.edges),
        attributeTypes = mergeAttributeTypes(attributeTypes, other.attributeTypes),
        attributeDescriptors = mergeAttributeDescriptors(attributeDescriptors, other.attributeDescriptors)
    )

    // Fold edges that share a directed endpoint pair into one, unioning their attributes instead of
    // dropping all but the first. The first edge wins on a conflicting key, matching the first-wins
    // rule the attribute-type and descriptor merges already use.
    private fun mergeEdges(allEdges: List<Edge>): List<Edge> = allEdges
        .groupBy { Pair(it.fromNodeName, it.toNodeName) }
        .map { (_, edgesForPair) -> edgesForPair.reduce(::unionAttributes) }

    private fun unionAttributes(first: Edge, second: Edge): Edge =
        Edge(first.fromNodeName, first.toNodeName, second.attributes + first.attributes)
}
