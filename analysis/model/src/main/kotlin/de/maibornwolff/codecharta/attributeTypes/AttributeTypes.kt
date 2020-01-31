package de.maibornwolff.codecharta.attributeTypes

import de.maibornwolff.codecharta.model.AttributeType

data class AttributeTypes(
        val attributeTypes: Map<String, AttributeType>,
        val type: String = "") 
