package de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes

class JavaNodeTypes : MetricNodeTypes {
    override val complexityNodeTypes = TreeNodeTypes(
        simpleNodeTypes = setOf(
            // if
            "if_statement",
            // loop
            "do_statement",
            "for_statement",
            "while_statement",
            "enhanced_for_statement",
            // conditional
            "ternary_expression",
            // case
            "switch_label",
            // catch
            "catch_clause",
            // function
            "constructor_declaration",
            "method_declaration",
            "lambda_expression",
            "static_initializer",
            "compact_constructor_declaration"
        ),
        nestedNodeTypes = setOf(
            // logical binary
            NestedNodeType(
                baseNodeType = "binary_expression",
                childNodeFieldName = "operator",
                childNodeTypes = setOf("&&", "||")
            )
        )
    )

    override val commentLineNodeTypes = TreeNodeTypes(
        simpleNodeTypes = setOf(
            "block_comment",
            "line_comment"
        )
    )
}
