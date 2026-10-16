package de.maibornwolff.codecharta.analysers.parsers.unified

import de.maibornwolff.codecharta.model.AttributeDescriptor

// Counts of database objects, which only the languages that have them report
private val ATTRIBUTES_OF_SOME_LANGUAGES = setOf("number_of_stored_procedures", "number_of_triggers", "number_of_views", "number_of_tables")

internal fun getAttributeDescriptorsOfMeasured(measuredAttributes: Set<String>): Map<String, AttributeDescriptor> =
    getAttributeDescriptors().filterKeys { it !in ATTRIBUTES_OF_SOME_LANGUAGES || it in measuredAttributes }

internal fun getAttributeDescriptors(): Map<String, AttributeDescriptor> {
    val ghLink = "https://codecharta.com/docs/parser/unified"
    val analyzerName = setOf("unifiedParser")
    return mapOf(
        "complexity" to AttributeDescriptor(
            title = "Complexity",
            description = "Complexity of the file representing how much cognitive load is needed to overview the whole file",
            link = ghLink,
            direction = -1,
            analyzers = analyzerName
        ),
        "logic_complexity" to AttributeDescriptor(
            title = "Logic complexity",
            description = "Complexity of the file based on number of paths through the code, similar to cyclomatic complexity",
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
            description = "Lines of code including empty lines and comments",
            link = ghLink,
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
        ),
        "max_parameters_per_function" to AttributeDescriptor(
            title = "Maximum parameters per function",
            description = "The maximum number of parameters a function or method has for this file.",
            link = ghLink,
            direction = -1,
            analyzers = analyzerName
        ),
        "min_parameters_per_function" to AttributeDescriptor(
            title = "Minimum parameters per function",
            description = "The minimum number of parameters a function or method has for this file.",
            link = ghLink,
            direction = -1,
            analyzers = analyzerName
        ),
        "median_parameters_per_function" to AttributeDescriptor(
            title = "Median parameters per function",
            description = "The median number of parameters a function or method has for this file.",
            link = ghLink,
            direction = -1,
            analyzers = analyzerName
        ),
        "mean_parameters_per_function" to AttributeDescriptor(
            title = "Mean parameters per function",
            description = "The mean number of parameters a function or method has for this file.",
            link = ghLink,
            direction = -1,
            analyzers = analyzerName
        ),
        "max_complexity_per_function" to AttributeDescriptor(
            title = "Maximum complexity per function",
            description = "The maximum complexity in the body of a function of this file.",
            link = ghLink,
            direction = -1,
            analyzers = analyzerName
        ),
        "min_complexity_per_function" to AttributeDescriptor(
            title = "Minimum complexity per function",
            description = "The minimum number of complexity in the body of a function of this file.",
            link = ghLink,
            direction = -1,
            analyzers = analyzerName
        ),
        "mean_complexity_per_function" to AttributeDescriptor(
            title = "Mean complexity per function",
            description = "The mean complexity found in the body of a function of this file.",
            link = ghLink,
            direction = -1,
            analyzers = analyzerName
        ),
        "median_complexity_per_function" to AttributeDescriptor(
            title = "Median complexity per function",
            description = "The median complexity found in the body of a function of this file.",
            link = ghLink,
            direction = -1,
            analyzers = analyzerName
        ),
        "max_rloc_per_function" to AttributeDescriptor(
            title = "Maximum real lines of code in a function",
            description = "The maximum number of real lines of code in a function of this file.",
            link = ghLink,
            direction = -1,
            analyzers = analyzerName
        ),
        "min_rloc_per_function" to AttributeDescriptor(
            title = "Minimum real lines of code in a function",
            description = "The minimum number of real lines of code in a function of this file.",
            link = ghLink,
            direction = -1,
            analyzers = analyzerName
        ),
        "mean_rloc_per_function" to AttributeDescriptor(
            title = "Mean real lines of code in a function",
            description = "The mean number of real lines of code in a function of this file.",
            link = ghLink,
            direction = -1,
            analyzers = analyzerName
        ),
        "median_rloc_per_function" to AttributeDescriptor(
            title = "Median real lines of code in a function",
            description = "The median number of real lines of code in a function of this file.",
            link = ghLink,
            direction = -1,
            analyzers = analyzerName
        ),
        "long_method" to AttributeDescriptor(
            title = "Long Method",
            description = "Code smell showing the number of functions with more than 10 real lines of code (rloc)",
            link = ghLink,
            direction = -1,
            analyzers = analyzerName
        ),
        "long_parameter_list" to AttributeDescriptor(
            title = "Long Parameter List",
            description = "Code smell showing the number of functions with more than 4 parameters",
            link = ghLink,
            direction = -1,
            analyzers = analyzerName
        ),
        "excessive_comments" to AttributeDescriptor(
            title = "Excessive Comments",
            description = "Code smell showing whether a file has more than 10 comment lines",
            link = ghLink,
            direction = -1,
            analyzers = analyzerName
        ),
        "comment_ratio" to AttributeDescriptor(
            title = "Comment Ratio",
            description = "The ratio of comment lines to real lines of code (rloc)",
            link = ghLink,
            direction = 0,
            analyzers = analyzerName
        ),
        "message_chains" to AttributeDescriptor(
            title = "Message Chains",
            description = "Code smell showing occurrences of method call chains with 4 or more consecutive calls " +
                "suggesting tight coupling",
            link = ghLink,
            direction = -1,
            analyzers = analyzerName
        ),
        "number_of_stored_procedures" to AttributeDescriptor(
            title = "Number of stored procedures",
            description = "The number of SQL stored procedures the file defines with a body, " +
                "on their own or in an Oracle package body.",
            link = ghLink,
            direction = -1,
            analyzers = analyzerName
        ),
        "number_of_triggers" to AttributeDescriptor(
            title = "Number of triggers",
            description = "The number of SQL triggers the file creates, with a body or calling a function.",
            link = ghLink,
            direction = -1,
            analyzers = analyzerName
        ),
        "number_of_views" to AttributeDescriptor(
            title = "Number of views",
            description = "The number of SQL views the file defines, materialized ones included.",
            link = ghLink,
            direction = -1,
            analyzers = analyzerName
        ),
        "number_of_tables" to AttributeDescriptor(
            title = "Number of tables",
            description = "The number of SQL tables the file creates, without temporary tables and the tables a routine creates.",
            link = ghLink,
            direction = -1,
            analyzers = analyzerName
        )
    )
}
