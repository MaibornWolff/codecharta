package de.maibornwolff.codecharta.analysers.parsers.rawtext

import de.maibornwolff.codecharta.model.AttributeDescriptor

internal fun getAttributeDescriptors(maxOccurringIndentationLevel: Int): Map<String, AttributeDescriptor> {
    val ghLink = "https://codecharta.com/docs/parser/raw-text"
    val analyzerName = setOf("rawtextParser")
    val descriptors: MutableMap<String, AttributeDescriptor> = mutableMapOf()
    for (i in 0..maxOccurringIndentationLevel) {
        descriptors["indentation_level_$i+"] =
            AttributeDescriptor(
                title = "Statements with indentation level greater or equal $i",
                description = "Statements with indentation level greater or equal $i",
                link = ghLink,
                direction = -1,
                analyzers = analyzerName
            )
    }

    descriptors["loc"] =
        AttributeDescriptor(
            title = "Lines of Code",
            description = "Lines of code including empty lines and comments",
            link = ghLink,
            direction = -1,
            analyzers = analyzerName
        )

    descriptors["rloc"] =
        AttributeDescriptor(
            title = "Real Lines of Code",
            description = "Number of lines that contain at least one character " +
                "which is neither a whitespace nor a tabulation nor part of a comment",
            link = ghLink,
            direction = -1,
            analyzers = analyzerName
        )

    descriptors["comment_lines"] =
        AttributeDescriptor(
            title = "Comment lines",
            description = "Number of lines containing either a comment or commented-out code",
            link = ghLink,
            direction = -1,
            analyzers = analyzerName
        )

    return descriptors.toMap()
}
