package de.maibornwolff.codecharta.model

interface AttributeGenerator {
fun getAttributeDescriptorMaps(): Map<String, AttributeDescriptor>
}
