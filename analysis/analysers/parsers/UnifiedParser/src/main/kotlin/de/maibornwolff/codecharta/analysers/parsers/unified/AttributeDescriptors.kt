package de.maibornwolff.codecharta.analysers.parsers.unified

import de.maibornwolff.codecharta.model.AttributeDescriptor

internal fun getAttributeDescriptors(): Map<String, AttributeDescriptor> {
    val ghLink = "https://codecharta.com/docs/parser/unified"
    return mapOf(
        "complexity" to AttributeDescriptor(
            title = "Complexity",
            description = "TODO", // TODO: which complexity is it exactly?
            link = ghLink,
            direction = -1
        )
    )
}
