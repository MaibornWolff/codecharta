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
                baseNodeType = "lambda_literal",
                parentNodeType = "property_declaration"
            ),
            NestedNodeType(
                baseNodeType = "anonymous_function",
                parentNodeType = "property_declaration"
            ),
            NestedNodeType(
                baseNodeType = "anonymous_initializer",
                parentNodeType = "property_declaration"
            ),
            NestedNodeType(
                baseNodeType = "function_body",
                parentNodeType = "function_declaration"
            )
        )
    )

    override val functionBodyNodeTypes = TreeNodeTypes(
        simpleNodeTypes = setOf(
            "function_body"
        )
    )

    override val functionParameterNodeTypes = TreeNodeTypes(
        simpleNodeTypes = setOf(
            "parameter"
        )
    )

    override val messageChainsNodeTypes = TreeNodeTypes(
        simpleNodeTypes = setOf(
            "call_expression",
            "navigation_expression"
        )
    )

    override val messageChainsCallNodeTypes = TreeNodeTypes(
        simpleNodeTypes = setOf(
            "call_expression"
        )
    )
}
