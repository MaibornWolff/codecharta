package de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes

class BashNodeTypes : MetricNodeTypes {
    override val logicComplexityNodeTypes = TreeNodeTypes(
        simpleNodeTypes = setOf(
            // if
            "if_statement",
            "elif_clause",
            // loop
            "for_statement",
            "while_statement",
            "c_style_for_statement",
            // conditional
            "ternary_expression",
            "list",
            // case
            "case_item"
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
            "function_definition"
        )
    )

    override val commentLineNodeTypes = TreeNodeTypes(
        simpleNodeTypes = setOf(
            "comment"
        )
    )

    override val numberOfFunctionsNodeTypes = TreeNodeTypes(
        simpleNodeTypes = setOf(
            "function_definition"
        )
    )

    override val parameterOfFunctionNodeTypes = TreeNodeTypes(
        simpleNodeTypes = setOf(
            ""
        )
    )
}
