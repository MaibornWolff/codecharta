package de.maibornwolff.codecharta.analysers.parsers.unified

import de.maibornwolff.codecharta.model.AttributeDescriptor

internal fun getAttributeDescriptors(): Map<String, AttributeDescriptor> {
    val ghLink = "https://codecharta.com/docs/parser/unified"
    return mapOf(
        "complexity" to AttributeDescriptor(
            title = "Complexity",
            description = "Complexity of the file based on the number of paths through the code (McCabe Complexity)",
            link = "https://en.wikipedia.org/wiki/Cyclomatic_complexity",
            direction = -1
        ),
        "comment_lines" to AttributeDescriptor(
            title = "Comment lines",
            description = "Number of lines containing either a comment or commented-out code",
            link = ghLink,
            direction = -1
        )
    )
}
