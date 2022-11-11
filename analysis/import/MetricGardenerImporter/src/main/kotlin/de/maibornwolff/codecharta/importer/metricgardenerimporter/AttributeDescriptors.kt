package de.maibornwolff.codecharta.importer.metricgardenerimporter

import de.maibornwolff.codecharta.model.AttributeDescriptor

fun getAttributeDescriptors(): Map<String, AttributeDescriptor> {
    val descriptors = mutableMapOf<String, AttributeDescriptor>()
    val npmLink = "https://www.npmjs.com/package/metric-gardener"

    descriptors["mcc"] = AttributeDescriptor(description = "Cyclomatic complexity", link = npmLink)
    descriptors["functions"] = AttributeDescriptor(description = "Number of functions", link = npmLink)
    descriptors["classes"] = AttributeDescriptor(description = "Number of classes", link = npmLink)
    descriptors["lines_of_code"] = AttributeDescriptor(description = "Lines of code", link = npmLink)
    descriptors["comment_lines "] = AttributeDescriptor(description = "Number of code lines with comments", link = npmLink)
    descriptors["real_lines_of_code"] = AttributeDescriptor(description = "Real lines of code", link = npmLink)

    return descriptors.toMap()
}
