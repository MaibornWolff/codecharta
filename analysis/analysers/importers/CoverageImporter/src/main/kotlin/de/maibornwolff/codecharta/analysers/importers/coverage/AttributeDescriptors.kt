package de.maibornwolff.codecharta.analysers.importers.coverage

import de.maibornwolff.codecharta.analysers.importers.coverage.strategies.CoverageAttributes
import de.maibornwolff.codecharta.model.AttributeDescriptor
import de.maibornwolff.codecharta.model.AttributeType
import de.maibornwolff.codecharta.model.AttributeTypes

internal fun getAttributeDescriptors(format: Format? = null): Map<String, AttributeDescriptor> {
    if (format == null) {
        return CoverageAttributes.entries.associateBy({ it.attributeName }, { it.attributeDescriptor })
    }

    return format.coverageAttributes.associateBy({ it.attributeName }, { it.attributeDescriptor })
}

internal fun getAttributeTypes(format: Format): AttributeTypes {
    val attributeTypes: MutableMap<String, AttributeType> =
        format.coverageAttributes.associateBy(
            { it.attributeName },
            { it.attributeType }
        ) as MutableMap<String, AttributeType>
    return AttributeTypes(attributeTypes = attributeTypes, type = "nodes")
}
