package de.maibornwolff.codecharta.model

import de.maibornwolff.codecharta.util.Logger

/**
 * The metrics overlay: per-node attributes (materialised onto the wire keyed by [NodeId]; carried
 * in memory on the node tree), the metric `attributeTypes`, their `attributeDescriptors`, and the
 * reserved `clusters` slot. The old `attributeTypes` node/edge split lives here for nodes; edge
 * types moved to the [DependencyLens].
 */
class MetricsLens(
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

internal fun mergeAttributeTypes(first: Map<String, AttributeType>, second: Map<String, AttributeType>): Map<String, AttributeType> {
    val merged = first.toMutableMap()
    second.forEach { (metric, type) -> merged.putIfAbsent(metric, type) }
    return merged
}

internal fun mergeAttributeDescriptors(
    first: Map<String, AttributeDescriptor>,
    second: Map<String, AttributeDescriptor>
): Map<String, AttributeDescriptor> {
    val merged = LinkedHashMap<String, AttributeDescriptor>()
    first.forEach { (metric, descriptor) -> merged[metric] = descriptor.withAnalyzersOrUnknown() }
    second.forEach { (metric, descriptor) ->
        val normalized = descriptor.withAnalyzersOrUnknown()
        val existing = merged[metric]
        if (existing == null) {
            merged[metric] = normalized
        } else {
            warnIfDescriptorsDiffer(existing, metric, normalized)
            existing.analyzers = existing.analyzers union normalized.analyzers
        }
    }
    return merged
}

private fun AttributeDescriptor.withAnalyzersOrUnknown(): AttributeDescriptor {
    if (analyzers.isEmpty()) analyzers = setOf("Unknown")
    return this
}

private fun warnIfDescriptorsDiffer(existing: AttributeDescriptor, metric: String, incoming: AttributeDescriptor) {
    if (existing.title != incoming.title) Logger.info { "Title of '$metric' metric differs between files! Using value of first file..." }
    if (existing.description !=
        incoming.description
    ) {
        Logger.info { "Description of '$metric' metric differs between files! Using value of first file..." }
    }
    if (existing.link != incoming.link) Logger.info { "Link of '$metric' metric differs between files! Using value of first file..." }
    if (existing.direction !=
        incoming.direction
    ) {
        Logger.info { "Direction of '$metric' metric differs between files! Using value of first file..." }
    }
}
