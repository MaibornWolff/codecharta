package de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes

class PhpNodeTypes : MetricNodeTypes {
    override val complexityNodeTypes = TreeNodeTypes(
        simpleNodeTypes = setOf(
            // if
            "if_statement",
            "else_if_clause",
            // loop
            "do_statement",
            "for_statement",
            "while_statement",
            "foreach_statement",
            // conditional
            "conditional_expression",
            // case
            "case_statement",
            "default_statement",
            "match_conditional_expression",
            "match_default_expression",
            // catch
            "catch_clause",
            // function
            "method_declaration",
            "lambda_expression",
            "arrow_function",
            "anonymous_function",
            "function_definition",
            "function_static_declaration"
        ),
        nestedNodeTypes = setOf(
            // logical binary
            NestedNodeType(
                baseNodeType = "binary_expression",
                childNodeFieldName = "operator",
                childNodeTypes = setOf("&&", "||", "??", "and", "or", "xor")
            )
        )
    )

    override val commentLineNodeTypes = TreeNodeTypes(
        simpleNodeTypes = setOf(
            "comment"
        )
    )
}
