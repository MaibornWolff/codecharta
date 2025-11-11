package de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes

class PhpNodeTypes : MetricNodeTypes {
    override val logicComplexityNodeTypes = TreeNodeTypes(
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
            "catch_clause"
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

    override val functionComplexityNodeTypes = TreeNodeTypes(
        simpleNodeTypes = setOf(
            "method_declaration",
            "lambda_expression",
            "arrow_function",
            "anonymous_function",
            "function_definition",
            "function_static_declaration"
        )
    )

    override val commentLineNodeTypes = TreeNodeTypes(
        simpleNodeTypes = setOf(
            "comment"
        )
    )

    override val numberOfFunctionsNodeTypes = TreeNodeTypes(
        simpleNodeTypes = setOf(
            "method_declaration",
            "function_definition",
            "function_static_declaration"
        ),
        nestedNodeTypes = setOf(
            NestedNodeType(
                baseNodeType = "assignment_expression",
                childNodeFieldName = "right",
                childNodeTypes = setOf("anonymous_function", "arrow_function", "lambda_expression")
            )
        )
    )

    override val functionBodyNodeTypes = TreeNodeTypes(
        simpleNodeTypes = setOf(
            "compound_statement"
        )
    )

    override val functionParameterNodeTypes = TreeNodeTypes(
        simpleNodeTypes = setOf(
            "simple_parameter"
        )
    )

    override val messageChainsNodeTypes = TreeNodeTypes(
        simpleNodeTypes = setOf(
            "member_call_expression",
            "scoped_call_expression",
            "member_access_expression"
        )
    )

    override val messageChainsCallNodeTypes = TreeNodeTypes(
        simpleNodeTypes = setOf(
            "member_call_expression",
            "scoped_call_expression"
        )
    )
}
