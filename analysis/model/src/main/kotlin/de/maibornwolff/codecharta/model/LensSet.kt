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
    fun allAttributeDescriptors(): Map<String, AttributeDescriptor> = metrics.attributeDescriptors + dependency.attributeDescriptors

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
            // 1.5 shares one flat descriptor namespace; route a descriptor to the dependency lens
            // when its metric is an edge type, otherwise to the metrics lens.
            val edgeDescriptors = attributeDescriptors.filterKeys { it in edgeTypes.keys }
            val metricDescriptors = attributeDescriptors.filterKeys { it !in edgeTypes.keys }
            return LensSet(
                metrics = MetricsLens(nodeTypes, metricDescriptors),
                dependency = DependencyLens(edges, edgeTypes, edgeDescriptors)
            )
        }
    }
}
