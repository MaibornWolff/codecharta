package de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes

class JavaNodeTypes : MetricNodeTypes {
    override val logicComplexityNodeTypes = TreeNodeTypes(
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
            "catch_clause"
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

    override val functionComplexityNodeTypes = TreeNodeTypes(
        simpleNodeTypes = setOf(
            "constructor_declaration",
            "method_declaration",
            "lambda_expression",
            "static_initializer",
            "compact_constructor_declaration"
        )
    )

    override val commentLineNodeTypes = TreeNodeTypes(
        simpleNodeTypes = setOf(
            "block_comment",
            "line_comment"
        )
    )

    override val numberOfFunctionsNodeTypes = TreeNodeTypes(
        simpleNodeTypes = setOf(
            "method_declaration",
            "constructor_declaration",
            "compact_constructor_declaration"
        ),
        nestedNodeTypes = setOf(
            NestedNodeType(
                baseNodeType = "variable_declarator",
                childNodeFieldName = "value",
                childNodeTypes = setOf("lambda_expression")
            )
        )
    )

    override val functionBodyNodeTypes = TreeNodeTypes(
        simpleNodeTypes = setOf(
            "block"
        )
    )

    override val functionParameterNodeTypes = TreeNodeTypes(
        simpleNodeTypes = setOf(
            "formal_parameter"
        )
    )
}
