package de.maibornwolff.codecharta.importer.tokeiimporter

import de.maibornwolff.codecharta.model.AttributeDescriptor

fun getAttributeDescriptors(): Map<String, AttributeDescriptor> {
    val descriptors = mutableMapOf<String, AttributeDescriptor>()
    val ghLink = "https://github.com/XAMPPRocky/tokei/"
    descriptors["empty_lines"] = AttributeDescriptor(title = "Empty Lines", description = "Number of empty lines", link = ghLink)
    descriptors["rloc"] = AttributeDescriptor(title = "Real Lines of Code", description = "Number of physical lines that contain at least one character which is neither a whitespace nor a tabulation nor part of a comment", link = ghLink)
    descriptors["comment_lines"] = AttributeDescriptor(title = "Comment Lines", description = "Number of lines containing either a comment or commented-out code", link = ghLink)
    descriptors["loc"] = AttributeDescriptor(title = "Lines of Code", description = "Lines of code including empty lines and comments", link = ghLink)

    return descriptors.toMap()
}
