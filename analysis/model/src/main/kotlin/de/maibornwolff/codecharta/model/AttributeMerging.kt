package de.maibornwolff.codecharta.model

import de.maibornwolff.codecharta.util.Logger

/**
 * Shared attribute-type/descriptor merge helpers used by every concrete [Lens]. They live here, on
 * neutral ground, because both [MetricsLens] and [DependencyLens] depend on them — keeping them in
 * one lens implementation would make the other reach across into it.
 */
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
            merged[metric] = existing.copy(analyzers = existing.analyzers union normalized.analyzers)
        }
    }
    return merged
}

// Pure: never mutates the input descriptor, so a descriptor shared across projects is not corrupted.
private fun AttributeDescriptor.withAnalyzersOrUnknown(): AttributeDescriptor =
    if (analyzers.isEmpty()) copy(analyzers = setOf("Unknown")) else this

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
