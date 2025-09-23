package de.maibornwolff.codecharta.analysers.importers.tokei

import de.maibornwolff.codecharta.model.AttributeDescriptor

internal fun getAttributeDescriptors(): Map<String, AttributeDescriptor> {
    val ghLink = "https://github.com/XAMPPRocky/tokei/"
    val analyzerName = setOf("tokeiImporter")
    return mapOf(
        "empty_lines" to
            AttributeDescriptor(
                title = "Empty Lines",
                description = "Number of empty lines",
                link = ghLink,
                direction = -1,
                analyzers = analyzerName
            ),
        "rloc" to
            AttributeDescriptor(
                title = "Real Lines of Code",
                description = "Number of code lines that contain at least one character" +
                    " which is neither a whitespace nor a tabulation nor part of a comment",
                link = ghLink,
                direction = -1,
                analyzers = analyzerName
            ),
        "comment_lines" to
            AttributeDescriptor(
                title = "Comment Lines",
                description = "Number of lines containing either a comment or commented-out code",
                link = ghLink,
                direction = -1,
                analyzers = analyzerName
            ),
        "loc" to
            AttributeDescriptor(
                title = "Lines of Code",
                description = "Lines of code including empty lines and comments",
                link = ghLink,
                direction = -1,
                analyzers = analyzerName
            )
    )
}
