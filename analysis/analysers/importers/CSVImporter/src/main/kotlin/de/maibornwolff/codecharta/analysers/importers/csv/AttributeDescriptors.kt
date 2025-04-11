package de.maibornwolff.codecharta.analysers.importers.csv

import de.maibornwolff.codecharta.model.AttributeDescriptor

internal fun getAttributeDescriptors(): Map<String, AttributeDescriptor> {
    val ghLink = "https://codecharta.com/docs/importer/csv"
    val descriptors: MutableMap<String, AttributeDescriptor> = mutableMapOf()
    descriptors["loc"] =
        AttributeDescriptor(
            title = "Lines of Code",
            description = "Lines of code including empty lines and comments", link = ghLink, direction = -1
        )
    descriptors["rloc"] =
        AttributeDescriptor(
            title = "Real Lines of Code",
            description = "Number of code lines that contain" +
                " at least one character which is neither a whitespace nor a tabulation nor part of a comment",
            link = ghLink, direction = -1
        )
    descriptors["classes"] =
        AttributeDescriptor(
            title = "Number of Classes", description = "Number of classes", link = ghLink,
            direction = -1
        )
    descriptors["functions_per_class"] =
        AttributeDescriptor(
            title = "Functions per Class", description = "Number of functions per class",
            link = ghLink, direction = -1
        )
    descriptors["average_statements_per_function"] =
        AttributeDescriptor(
            title = "Average Statements per Function",
            description = "Average number of statements per function", link = ghLink, direction = -1
        )
    descriptors["max_function_complexity"] =
        AttributeDescriptor(
            title = "Maximum Function Complexity",
            description = "Maximum cyclomatic complexity based on the number of paths through a function",
            link = ghLink,
            direction = -1
        )
    descriptors["max_block_depth"] =
        AttributeDescriptor(
            title = "Maximum Block Depth", description = "Maximum nested block depth found",
            link = ghLink, direction = -1
        )
    descriptors["average_block_depth"] =
        AttributeDescriptor(
            title = "Average Block Depth", description = "Average nested block depth found",
            link = ghLink, direction = -1
        )
    descriptors["average_function_complexity"] =
        AttributeDescriptor(
            title = "Average Function Complexity",
            description = "Average cyclomatic complexity based on the number of paths through a function",
            link = ghLink, direction = -1
        )
    descriptors["sm_percent_branch_statements"] =
        AttributeDescriptor(
            title = "Percentage of Branch Statements",
            description = "Percentage of branch statements", link = ghLink, direction = -1
        )
    descriptors["sm_method_call_statements"] =
        AttributeDescriptor(
            title = "Method Calls", description = "Number of method call statements", link = ghLink,
            direction = -1
        )
    descriptors["sm_percent_lines_with_comments"] =
        AttributeDescriptor(
            title = "Percentage of Comment Lines",
            description = "Percentage of code lines that contain comments", link = ghLink, direction = -1
        )

    for (i in 0..9) {
        descriptors["statements_at_level_$i"] =
            AttributeDescriptor(
                title = "Statements at Block Level $i",
                description = "Statements at block level $i", link = ghLink, direction = -1
            )
    }

    return descriptors.toMap()
}
