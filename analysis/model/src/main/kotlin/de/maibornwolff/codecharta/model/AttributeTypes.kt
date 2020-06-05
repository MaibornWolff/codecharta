package de.maibornwolff.codecharta.model

class AttributeTypes(
    val attributeTypes: MutableMap<String, AttributeType> = mutableMapOf(),
    val type: String
) {
    fun add(metricName: String, attributeType: AttributeType): AttributeTypes {
        attributeTypes[metricName] = attributeType
        return this
    }
}
