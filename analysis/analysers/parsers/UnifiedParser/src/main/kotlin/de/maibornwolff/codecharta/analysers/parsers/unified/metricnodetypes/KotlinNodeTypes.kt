package de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes

class KotlinNodeTypes : MetricNodeTypes {
    override val complexityNodeTypes = TreeNodeTypes(
        simpleNodeTypes = setOf(
            // if
            "if_expression",
            // loop
            "for_statement",
            "while_statement",
            "do_while_statement",
            // conditional
            "elvis_expression",
            // logical
            "conjunction_expression",
            "disjunction_expression",
            // case
            "when_entry",
            // catch
            "catch_block",
            // function
            "function_declaration",
            "anonymous_function",
            "anonymous_initializer",
            "lambda_literal",
            "secondary_constructor",
            "setter",
            "getter"
        )
    )
    override val commentLineNodeTypes = TreeNodeTypes(
        // logical binary
        simpleNodeTypes = setOf(
            "line_comment",
            "multiline_comment"
        )
    )
}
