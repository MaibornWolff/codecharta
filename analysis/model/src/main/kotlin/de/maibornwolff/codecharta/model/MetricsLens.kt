package de.maibornwolff.codecharta.model

import com.google.gson.JsonElement

/**
 * The metrics overlay: per-node attributes (materialised onto the wire keyed by [NodeId]; carried
 * in memory on the node tree), the metric `attributeTypes`, their `attributeDescriptors`, and the
 * reserved `clusters` slot (kept as raw JSON so it round-trips verbatim). The old `attributeTypes`
 * node/edge split lives here for nodes; edge types moved to the [DependencyLens].
 */
data class MetricsLens(
    val attributeTypes: Map<String, AttributeType> = emptyMap(),
    val attributeDescriptors: Map<String, AttributeDescriptor> = emptyMap(),
    val clusters: List<JsonElement> = emptyList()
) : Lens {
    /**
     * Merges [other] in, keeping the first occurrence of each attribute type, unioning descriptors, and
     * unioning clusters with exact duplicates dropped (so overlapping merges don't double the reserved slot).
     */
    fun merge(other: MetricsLens): MetricsLens = MetricsLens(
        attributeTypes = mergeAttributeTypes(attributeTypes, other.attributeTypes),
        attributeDescriptors = mergeAttributeDescriptors(attributeDescriptors, other.attributeDescriptors),
        clusters = (clusters + other.clusters).distinct()
    )
}
