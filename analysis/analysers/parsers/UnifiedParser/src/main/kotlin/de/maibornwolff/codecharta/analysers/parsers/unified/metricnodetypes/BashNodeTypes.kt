package de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes

class BashNodeTypes : MetricNodeTypes {
    override val complexityNodeTypes = TreeNodeTypes(
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
            "case_item",
            // function
            "function_definition"
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
            "comment"
        )
    )

    // TODO: fill up
    override val numberOfFunctionsNodeTypes = TreeNodeTypes(
        simpleNodeTypes = setOf()
    )
}
