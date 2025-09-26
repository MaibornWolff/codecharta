package de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes

class KotlinNodeTypes : MetricNodeTypes {
    override val logicComplexityNodeTypes = TreeNodeTypes(
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
            "catch_block"
        )
    )

    override val functionComplexityNodeTypes = TreeNodeTypes(
        simpleNodeTypes = setOf(
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

    override val numberOfFunctionsNodeTypes = TreeNodeTypes(
        simpleNodeTypes = setOf(
            "secondary_constructor",
            "setter",
            "getter"
        ),
        nestedNodeTypes = setOf(
            NestedNodeType(
                baseNodeType = "property_declaration",
                childNodeCount = 4,
                childNodePosition = 3,
                childNodeTypes = setOf("lambda_literal", "anonymous_function", "anonymous_initializer")
            ),
            NestedNodeType(
                baseNodeType = "function_declaration",
                childNodeCount = 4,
                childNodePosition = 3,
                childNodeTypes = setOf("function_body")
            ),
            NestedNodeType(
                baseNodeType = "function_declaration",
                childNodeCount = 5,
                childNodePosition = 4,
                childNodeTypes = setOf("function_body")
            ),
            NestedNodeType(
                baseNodeType = "function_declaration",
                childNodeCount = 6,
                childNodePosition = 5,
                childNodeTypes = setOf("function_body")
            ),
            NestedNodeType(
                baseNodeType = "function_declaration",
                childNodeCount = 7,
                childNodePosition = 6,
                childNodeTypes = setOf("function_body")
            )
        )
    )

    override val parameterOfFunctionNodeTypes = TreeNodeTypes(
        simpleNodeTypes = setOf(
            "parameter"
        )
    )
}
