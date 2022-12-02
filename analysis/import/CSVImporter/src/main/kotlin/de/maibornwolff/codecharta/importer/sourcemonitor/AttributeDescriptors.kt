package de.maibornwolff.codecharta.importer.sourcemonitor

import de.maibornwolff.codecharta.model.AttributeDescriptor

fun getAttributeDescriptors(): Map<String, AttributeDescriptor> {
    val ghLink = "https://github.com/SourceMonitor/SM-Info"
    val descriptors: MutableMap<String, AttributeDescriptor> = mutableMapOf()
    descriptors["loc"] = AttributeDescriptor(title = "Lines of Code", description = "Lines of code including empty lines and comments", link = ghLink)
    descriptors["rloc"] = AttributeDescriptor(title = "Real Lines of Code", description = "Number of physical lines that contain at least one character which is neither a whitespace nor a tabulation nor part of a comment", link = ghLink)
    descriptors["classes"] = AttributeDescriptor(title = "Number of Classes", description = "Number of classes", link = ghLink)
    descriptors["functions_per_class"] = AttributeDescriptor(title = "Functions per Class", description = "Number of functions per class", link = ghLink)
    descriptors["average_statements_per_function"] = AttributeDescriptor(title = "Average Statements per Function", description = "Average number of statements per method", link = ghLink)
    descriptors["max_function_mcc"] = AttributeDescriptor(title = "Maximum Cyclic Complexity", description = "Maximum cyclic complexity based on paths through the function by McCabe", link = ghLink)
    descriptors["max_block_depth"] = AttributeDescriptor(title = "Maximum Block Depth", description = "Maximum nested block depth found", link = ghLink)
    descriptors["average_block_depth"] = AttributeDescriptor(title = "Average Block Depth", description = "Average nested block depth found", link = ghLink)
    descriptors["average_function_mcc"] = AttributeDescriptor(title = "Average Cyclic Complexity", description = "Average cyclic complexity of functions", link = ghLink)
    descriptors["sm_percent_branch_statements"] = AttributeDescriptor(title = "Percentage of Branch Statements", description = "Percentage of branch statements", link = ghLink)
    descriptors["sm_method_call_statements"] = AttributeDescriptor(title = "Method Calls", description = "Number of method call statements", link = ghLink)
    descriptors["sm_percent_lines_with_comments"] = AttributeDescriptor(title = "Percentage of Comment Lines", description = "Percentage of code lines that contain comments", link = ghLink)

    for (i in 0..9) {
        descriptors["statements_at_level_$i"] = AttributeDescriptor(title = "Statements at Block Level $i", description = "Statements at block level $i", link = ghLink)
    }

    return descriptors.toMap()
}
