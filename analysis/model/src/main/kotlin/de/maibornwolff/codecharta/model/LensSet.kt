package de.maibornwolff.codecharta.model

import com.google.gson.JsonElement

data class LensSet(
    val metrics: MetricsLens = MetricsLens(),
    val dependency: DependencyLens = DependencyLens(),
    // Null means the file carries no domain lens at all; an empty one is the reserved-but-unused slot.
    val domain: DomainLens? = null,
    val opaqueLenses: Map<String, JsonElement> = emptyMap()
) {
    val security: JsonElement? get() = opaqueLenses[SECURITY_KEY]

    // Only `metrics`, `dependency` and `domain` are typed, so every other lens arrives as an opaque
    // payload whose node ids a filter can invalidate. Filters that re-path or drop nodes ask for these
    // names to refuse rather than emit a lens that references nodes the output no longer has.
    val dataBearingOpaqueLensNames: Set<String> get() = opaqueLenses.filterValues { it.carriesData() }.keys

    fun legacyAttributeTypes(): Map<String, MutableMap<String, AttributeType>> {
        val result = mutableMapOf<String, MutableMap<String, AttributeType>>()
        if (metrics.attributeTypes.isNotEmpty()) result[NODES_KEY] = metrics.attributeTypes.toMutableMap()
        if (dependency.attributeTypes.isNotEmpty()) result[EDGES_KEY] = dependency.attributeTypes.toMutableMap()
        return result
    }

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

// Whether an opaque JSON payload actually carries data. Empty objects/arrays and JSON null are the
// reserved-but-unused lens slots (e.g. domain/security `{}`); they reference nothing and are safe to
// carry through a re-path unchanged.
fun JsonElement.carriesData(): Boolean = when {
    isJsonNull -> false
    isJsonObject -> asJsonObject.size() > 0
    isJsonArray -> asJsonArray.size() > 0
    else -> true
}
