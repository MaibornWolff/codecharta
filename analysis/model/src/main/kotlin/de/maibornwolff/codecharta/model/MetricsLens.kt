package de.maibornwolff.codecharta.model

import com.google.gson.JsonElement

data class MetricsLens(
    val attributeTypes: Map<String, AttributeType> = emptyMap(),
    val attributeDescriptors: Map<String, AttributeDescriptor> = emptyMap(),
    val clusters: List<JsonElement> = emptyList()
) : Lens {
    fun merge(other: MetricsLens): MetricsLens = MetricsLens(
        attributeTypes = mergeAttributeTypes(attributeTypes, other.attributeTypes),
        attributeDescriptors = mergeAttributeDescriptors(attributeDescriptors, other.attributeDescriptors),
        clusters = (clusters + other.clusters).distinct()
    )
}
