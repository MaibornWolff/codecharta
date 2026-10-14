package de.maibornwolff.codecharta.model

object AttributeGeneratorRegistry {
    private val generators = mutableListOf<AttributeGenerator>()

    fun registerGenerator(generator: AttributeGenerator) {
        generators.add(generator)
    }

    fun getAllAttributeDescriptors(): Map<String, AttributeDescriptor> = generators
        .flatMap {
            it.getAttributeDescriptorMaps().entries
        }.associate {
            it.key to it.value
        }
}
