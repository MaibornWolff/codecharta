package de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes

class PythonNodeTypes : MetricNodeTypes {
    override val complexityNodeTypes = TreeNodeTypes(
        simpleNodeTypes = setOf(
            // if
            "if_statement",
            "elif_clause",
            "if_clause",
            // loop
            "for_statement",
            "while_statement",
            "for_in_clause",
            // conditional
            "conditional_expression",
            "list",
            // logical binary
            "boolean_operator",
            // case label
            "case_pattern",
            // catch block
            "except_clause",
            // function
            "function_definition",
            "lambda"
        )
    )

    // in python unassigned strings are used as block comments, meaning an expression that only has string as a child
    override val commentLineNodeTypes = TreeNodeTypes(
        simpleNodeTypes = setOf(
            "comment"
        ),
        nestedNodeTypes = setOf(
            NestedNodeType(
                baseNodeType = "expression_statement",
                childNodeCount = 1,
                childNodePosition = 0,
                childNodeTypes = setOf("string")
            )
        )
    )
}
