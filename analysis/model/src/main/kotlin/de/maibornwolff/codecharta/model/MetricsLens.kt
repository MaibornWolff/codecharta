package de.maibornwolff.codecharta.model

/**
 * The metrics overlay: per-node attributes (materialised onto the wire keyed by [NodeId]; carried
 * in memory on the node tree), the metric `attributeTypes`, their `attributeDescriptors`, and the
 * reserved `clusters` slot. The old `attributeTypes` node/edge split lives here for nodes; edge
 * types moved to the [DependencyLens].
 */
data class MetricsLens(
    val attributeTypes: Map<String, AttributeType> = emptyMap(),
    val attributeDescriptors: Map<String, AttributeDescriptor> = emptyMap(),
    val clusters: List<Any> = emptyList()
) : Lens {
    /** Merges [other] in, keeping the first occurrence of each attribute type and unioning descriptors. */
    fun merge(other: MetricsLens): MetricsLens = MetricsLens(
        attributeTypes = mergeAttributeTypes(attributeTypes, other.attributeTypes),
        attributeDescriptors = mergeAttributeDescriptors(attributeDescriptors, other.attributeDescriptors),
        clusters = clusters + other.clusters
    )
}
