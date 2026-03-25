package de.maibornwolff.codecharta.model

fun interface AttributeGenerator {
    fun getAttributeDescriptorMaps(): Map<String, AttributeDescriptor>
}
