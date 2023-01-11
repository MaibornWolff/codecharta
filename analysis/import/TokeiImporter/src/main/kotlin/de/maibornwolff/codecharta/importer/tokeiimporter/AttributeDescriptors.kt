package de.maibornwolff.codecharta.importer.tokeiimporter

import de.maibornwolff.codecharta.model.AttributeDescriptor

fun getAttributeDescriptors(): Map<String, AttributeDescriptor> {
    val ghLink = "https://github.com/XAMPPRocky/tokei/"
    return mapOf(
        "empty_lines" to AttributeDescriptor(title = "Empty Lines", description = "Number of empty lines", link = ghLink),
        "rloc" to AttributeDescriptor(title = "Real Lines of Code", description = "Number of physical lines that contain at least one character which is neither a whitespace nor a tabulation nor part of a comment", link = ghLink),
        "comment_lines" to AttributeDescriptor(title = "Comment Lines", description = "Number of lines containing either a comment or commented-out code", link = ghLink),
        "loc" to AttributeDescriptor(title = "Lines of Code", description = "Lines of code including empty lines and comments", link = ghLink)
    )
}
