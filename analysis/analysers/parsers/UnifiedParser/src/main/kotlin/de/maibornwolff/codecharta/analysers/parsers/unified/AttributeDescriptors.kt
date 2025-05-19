package de.maibornwolff.codecharta.analysers.parsers.unified

import de.maibornwolff.codecharta.model.AttributeDescriptor

internal fun getAttributeDescriptors(): Map<String, AttributeDescriptor> {
    val ghLink = "" //TODO: add after documentation for analyser is written
    return mapOf(
        "complexity" to AttributeDescriptor(
            title = "Complexity",
            description = "TODO", //TODO: change this
            link = ghLink,
            direction = -1
        )
    )
}
