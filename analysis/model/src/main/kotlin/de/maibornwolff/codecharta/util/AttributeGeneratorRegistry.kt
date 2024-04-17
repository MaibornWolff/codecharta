package de.maibornwolff.codecharta.util

import de.maibornwolff.codecharta.model.AttributeDescriptor
import de.maibornwolff.codecharta.model.AttributeGenerator

object AttributeGeneratorRegistry {
private val generators = mutableListOf<AttributeGenerator>()

    fun registerGenerator(generator: AttributeGenerator) {
        generators.add(generator)
    }

    fun getAllAttributeDescriptors(): Map<String, AttributeDescriptor> =
            generators.flatMap {
                it.getAttributeDescriptorMaps().entries
            }.associate {
                it.key to it.value
            }
}
