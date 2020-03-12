package de.maibornwolff.codecharta.model

class AttributeTypes{

    val attributeTypes = mutableListOf<Map<String, AttributeType>>()

    constructor(attributeTypes: MutableMap<String, AttributeType> = mutableMapOf(),
                       type: String) {

    }

    fun add(metricName: String, attributeType: AttributeType): AttributeTypes {
        attributeTypes[metricName] = attributeType
        return this
    }
}
