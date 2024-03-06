package de.maibornwolff.codecharta.importer.metricgardenerimporter

import de.maibornwolff.codecharta.model.AttributeDescriptor

fun getAttributeDescriptors(): Map<String, AttributeDescriptor> {
    val npmLink = "https://www.npmjs.com/package/metric-gardener"
    return mapOf(
        "mcc" to AttributeDescriptor(title = "Maximum Cyclic Complexity", description = "Maximum cyclic complexity based on paths through the code by McCabe", link = npmLink),
        "functions" to AttributeDescriptor(title = "Number of Functions", description = "Number of functions", link = npmLink),
        "classes" to AttributeDescriptor(title = "Number of Classes", description = "Number of classes", link = npmLink),
        "lines_of_code" to AttributeDescriptor(title = "Lines of Code", description = "Lines of code including empty lines and comments", link = npmLink),
        "comment_lines" to AttributeDescriptor(title = "Comment Lines", description = "Number of lines containing either a comment or commented-out code", link = npmLink),
        "real_lines_of_code" to AttributeDescriptor(title = "Real Lines of Code", description = "Number of physical lines that contain at least one character which is neither a whitespace nor a tabulation nor part of a comment", link = npmLink),
        "coupling_between_objects" to AttributeDescriptor(title = "Coupling between objects", description = "Coupling between objects", link = npmLink),
        "incoming_dependencies" to AttributeDescriptor(title = "Incoming dependencies", description = "Number of incoming dependencies", link = npmLink),
        "outgoing_dependencies" to AttributeDescriptor(title = "Outgoing dependencies", description = "Number of outgoing dependencies", link = npmLink),
        "instability" to AttributeDescriptor(title = "Instability", description = "Outgoing Dependencies / (Outgoing Dependencies + Incoming Dependencies)", link = npmLink),
   )
}
