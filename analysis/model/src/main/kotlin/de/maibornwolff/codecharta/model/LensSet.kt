package de.maibornwolff.codecharta.model

import com.google.gson.JsonElement

/**
 * The set of lenses a [Project] carries. [metrics] and [dependency] are concrete, typed lenses;
 * every other top-level lens — the reserved `domain`/`security` slots and any unknown lens a newer
 * tool emits — is preserved verbatim in [opaqueLenses] as raw JSON, so it survives a round-trip
 * through an older tool. [domain]/[security] are typed accessors over that bag.
 *
 * [fromLegacy] (legacy → lenses) and [legacyAttributeTypes]/[allAttributeDescriptors] (lenses →
 * legacy) are explicit converters between the lens model and the 1.5-era flat
 * `attributeTypes`/`attributeDescriptors`/`edges` triple. They are consumed only where the legacy
 * shape is genuinely needed — the 1.5 wire mapper, the 1.5 reader, and the [ProjectBuilder]
 * accumulation API (whose [ProjectBuilder.fromLenses] factory rebuilds the flat maps for lens-native
 * callers). The filters operate on the typed [MetricsLens]/[DependencyLens] and never reach for the
 * legacy projection.
 */
data class LensSet(
    val metrics: MetricsLens = MetricsLens(),
    val dependency: DependencyLens = DependencyLens(),
    val opaqueLenses: Map<String, JsonElement> = emptyMap()
) {
    /** The reserved `domain` lens, carried verbatim and present only if the source supplied one. */
    val domain: JsonElement? get() = opaqueLenses[DOMAIN_KEY]

    /** The reserved `security` lens, carried verbatim and present only if the source supplied one. */
    val security: JsonElement? get() = opaqueLenses[SECURITY_KEY]

    /** The edge-only `attributeTypes["nodes"]`/`["edges"]` split, rebuilt for legacy consumers. */
    fun legacyAttributeTypes(): Map<String, MutableMap<String, AttributeType>> {
        val result = mutableMapOf<String, MutableMap<String, AttributeType>>()
        if (metrics.attributeTypes.isNotEmpty()) result[NODES_KEY] = metrics.attributeTypes.toMutableMap()
        if (dependency.attributeTypes.isNotEmpty()) result[EDGES_KEY] = dependency.attributeTypes.toMutableMap()
        return result
    }

    /** The flat 1.5 descriptor map (metric and edge descriptors share one namespace). */
    fun allAttributeDescriptors(): Map<String, AttributeDescriptor> {
        // A metric registered on both lenses (e.g. `ccsh edgefilter` output) must not lose either side's
        // metadata when flattened: keep the metrics-lens descriptor and union in the edge lens's analyzers,
        // rather than letting `+` overwrite it with the dependency descriptor.
        val merged = metrics.attributeDescriptors.toMutableMap()
        dependency.attributeDescriptors.forEach { (metric, descriptor) ->
            val existing = merged[metric]
            merged[metric] =
                if (existing == null) descriptor else existing.copy(analyzers = existing.analyzers union descriptor.analyzers)
        }
        return merged
    }

    companion object {
        const val NODES_KEY = "nodes"
        const val EDGES_KEY = "edges"
        const val DOMAIN_KEY = "domain"
        const val SECURITY_KEY = "security"

        fun fromLegacy(
            edges: List<Edge>,
            attributeTypes: Map<String, Map<String, AttributeType>>,
            attributeDescriptors: Map<String, AttributeDescriptor>
        ): LensSet {
            val nodeTypes = attributeTypes[NODES_KEY] ?: emptyMap()
            val edgeTypes = attributeTypes[EDGES_KEY] ?: emptyMap()
            // 1.5 shares one flat descriptor namespace. A descriptor whose metric is an edge type goes
            // to the dependency lens; one whose metric is a node type (or has no matching type) goes to
            // the metrics lens. A metric registered as both a node and an edge type — e.g. `ccsh
            // edgefilter` output — lands in both lenses so neither side loses its metadata.
            val edgeDescriptors = attributeDescriptors.filterKeys { it in edgeTypes.keys }
            val metricDescriptors = attributeDescriptors.filterKeys { it in nodeTypes.keys || it !in edgeTypes.keys }
            return LensSet(
                metrics = MetricsLens(nodeTypes, metricDescriptors),
                dependency = DependencyLens(edges, edgeTypes, edgeDescriptors)
            )
        }
    }
}
