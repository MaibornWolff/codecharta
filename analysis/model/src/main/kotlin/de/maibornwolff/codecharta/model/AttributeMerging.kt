package de.maibornwolff.codecharta.model

import com.google.gson.JsonElement
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

/**
 * Unions two opaque-lens bags (the reserved `domain`/`security` slots and any unknown lens). Lens
 * payloads are opaque JSON, so they cannot be merged structurally: the first (reference) file wins on
 * a same-name collision and a warning is logged. Public because the merge resolver lives in a
 * separate module and this is the single owner of opaque-lens combination.
 */
fun mergeOpaqueLenses(first: Map<String, JsonElement>, second: Map<String, JsonElement>): Map<String, JsonElement> {
    val merged = LinkedHashMap(first)
    second.forEach { (lensName, payload) ->
        val existing = merged[lensName]
        when {
            existing == null -> merged[lensName] = payload
            existing != payload ->
                Logger.warn { "Opaque lens '$lensName' differs between files! Using value of first file..." }
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
