package de.maibornwolff.codecharta.importer.metricgardenerimporter

import de.maibornwolff.codecharta.model.AttributeDescriptor

fun getAttributeDescriptors(): Map<String, AttributeDescriptor> {
    val descriptors = mutableMapOf<String, AttributeDescriptor>()
    val npmLink = "https://www.npmjs.com/package/metric-gardener"

    descriptors["mcc"] = AttributeDescriptor(title = "Maximum Cyclic Complexity", description = "Maximum cyclic complexity", link = npmLink)
    descriptors["functions"] = AttributeDescriptor(title = "Number of Functions", description = "Number of functions", link = npmLink)
    descriptors["classes"] = AttributeDescriptor(title = "Number of Classes", description = "Number of classes", link = npmLink)
    descriptors["lines_of_code"] = AttributeDescriptor(title = "Lines of Code", description = "Lines of code including empty lines and comments", link = npmLink)
    descriptors["comment_lines"] = AttributeDescriptor(title = "Comment Lines", description = "Number of lines containing either comment or commented-out code", link = npmLink)
    descriptors["real_lines_of_code"] = AttributeDescriptor(title = "Real Lines of Code", description = "Number of physical lines that contain at least one character which is neither a whitespace nor a tabulation nor part of a comment", link = npmLink)

    return descriptors.toMap()
}
