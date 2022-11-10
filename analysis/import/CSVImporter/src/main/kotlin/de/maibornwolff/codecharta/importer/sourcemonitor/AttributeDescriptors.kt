package de.maibornwolff.codecharta.importer.sourcemonitor

import de.maibornwolff.codecharta.model.AttributeDescriptor

fun getAttributeDescriptors(): Map<String, AttributeDescriptor> {
    val ghLink = "https://github.com/SourceMonitor/SM-Info"
    val descriptors: MutableMap<String, AttributeDescriptor> = mutableMapOf()
    descriptors["loc"] = AttributeDescriptor(description = "Lines of code", link = ghLink)
    descriptors["statements"] = AttributeDescriptor(description = "Number of statements", link = ghLink)
    descriptors["classes"] = AttributeDescriptor(description = "Number of classes", link = ghLink)
    descriptors["functions_per_classs"] = AttributeDescriptor(description = "Number of functions per class", link = ghLink)
    descriptors["average_statements_per_function"] = AttributeDescriptor(description = "Average statements per method", link = ghLink)
    descriptors["max_function_mcc"] = AttributeDescriptor(description = "Maximum complexity", link = ghLink)
    descriptors["max_block_depth"] = AttributeDescriptor(description = "Maximum block depth", link = ghLink)
    descriptors["average_block_depth"] = AttributeDescriptor(description = "Average block depth", link = ghLink)
    descriptors["average_function_mcc"] = AttributeDescriptor(description = "Average complexity", link = ghLink)
    descriptors["sm_percent_branch_statements"] = AttributeDescriptor(description = "Percentage of branch statements", link = ghLink)
    descriptors["sm_method_call_statements"] = AttributeDescriptor(description = "Method call statements", link = ghLink)
    descriptors["sm_percent_lines_with_comments"] = AttributeDescriptor(description = "Percentage of comment lines", link = ghLink)

    for (i in 0..9) {
        descriptors["statements_at_level_$i"] = AttributeDescriptor(description = "Statements at block level $i", link = ghLink)
    }

    return descriptors.toMap()
}
