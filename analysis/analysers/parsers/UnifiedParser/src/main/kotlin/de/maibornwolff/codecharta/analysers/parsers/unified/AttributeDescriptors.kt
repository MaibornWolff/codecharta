package de.maibornwolff.codecharta.analysers.parsers.unified

import de.maibornwolff.codecharta.model.AttributeDescriptor

internal fun getAttributeDescriptors(): Map<String, AttributeDescriptor> {
    val ghLink = "https://codecharta.com/docs/parser/unified"
    val analyzerName = setOf("unifiedParser")
    return mapOf(
        "complexity" to AttributeDescriptor(
            title = "Complexity",
            description = "Complexity of the file based on the number of paths through the code (McCabe Complexity)",
            link = "https://en.wikipedia.org/wiki/Cyclomatic_complexity",
            direction = -1,
            analyzers = analyzerName
        ),
        "comment_lines" to AttributeDescriptor(
            title = "Comment lines",
            description = "Number of lines containing either a comment or commented-out code",
            link = ghLink,
            direction = -1,
            analyzers = analyzerName
        ),
        "loc" to AttributeDescriptor(
            title = "Lines of Code",
            description = "Lines of code including empty lines and comments", link = ghLink,
            direction = -1,
            analyzers = analyzerName
        ),
        "rloc" to AttributeDescriptor(
            title = "Real Lines of Code",
            description = "Number of lines that contain at least one character " +
                "which is neither a whitespace nor a tabulation nor part of a comment",
            link = ghLink,
            direction = -1,
            analyzers = analyzerName
        ),
        "number_of_functions" to AttributeDescriptor(
            title = "Number of functions",
            description = "The number of functions or methods present in the file. " +
                "Does not include anonymous or lambda functions.",
            link = ghLink,
            direction = -1,
            analyzers = analyzerName
        )
    )
}
