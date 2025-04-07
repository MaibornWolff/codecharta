package de.maibornwolff.codecharta.parser.rawtextparser

import de.maibornwolff.codecharta.model.AttributeDescriptor

internal fun getAttributeDescriptors(maxOccurringIndentationLevel: Int): Map<String, AttributeDescriptor> {
    val ghLink = "https://codecharta.com/docs/parser/raw-text"
    val descriptors: MutableMap<String, AttributeDescriptor> = mutableMapOf()
    for (i in 0..maxOccurringIndentationLevel) {
        descriptors["indentation_level_$i+"] =
            AttributeDescriptor(
                title = "Statements with indentation level greater or equal $i",
                description = "Statements with indentation level greater or equal $i", link = ghLink,
                direction = -1
            )
    }

    return descriptors.toMap()
}
