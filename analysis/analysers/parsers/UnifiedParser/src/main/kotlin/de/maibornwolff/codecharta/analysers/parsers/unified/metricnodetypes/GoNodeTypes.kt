package de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes

class GoNodeTypes : MetricNodeTypes {
    override val complexityNodeTypes = TreeNodeTypes(
        simpleNodeTypes = setOf(
            // if
            "if_statement",
            // loop
            "for_statement",
            // case
            "communication_case",
            "expression_case",
            "type_case",
            "default_case",
            // function
            "method_declaration",
            "func_literal",
            "function_declaration",
            "method_spec"
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
