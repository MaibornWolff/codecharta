package de.maibornwolff.codecharta.model

data class MetricsLens(
    val attributeTypes: Map<String, AttributeType> = emptyMap(),
    val attributeDescriptors: Map<String, AttributeDescriptor> = emptyMap()
) : Lens {
    fun merge(other: MetricsLens): MetricsLens = MetricsLens(
        attributeTypes = mergeAttributeTypes(attributeTypes, other.attributeTypes),
        attributeDescriptors = mergeAttributeDescriptors(attributeDescriptors, other.attributeDescriptors)
    )
}
