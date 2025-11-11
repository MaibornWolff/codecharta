package de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes

class CSharpNodeTypes : MetricNodeTypes {
    override val logicComplexityNodeTypes = TreeNodeTypes(
        simpleNodeTypes = setOf(
            // if
            "if_statement",
            // loop
            "do_statement",
            "foreach_statement",
            "for_statement",
            "while_statement",
            // conditional
            "conditional_expression",
            "is_expression",
            "and_pattern",
            "or_pattern",
            // case
            "switch_section",
            "switch_expression_arm",
            // catch
            "catch_clause"
        ),
        nestedNodeTypes = setOf(
            // logical binary
            NestedNodeType(
                baseNodeType = "binary_expression",
                childNodeFieldName = "operator",
                childNodeTypes = setOf("&&", "||", "??")
            )
        )
    )

    override val functionComplexityNodeTypes = TreeNodeTypes(
        simpleNodeTypes = setOf(
            "constructor_declaration",
            "method_declaration",
            "lambda_expression",
            "local_function_statement",
            "accessor_declaration"
        )
    )

    override val commentLineNodeTypes = TreeNodeTypes(
        simpleNodeTypes = setOf(
            "comment"
        )
    )

    override val numberOfFunctionsNodeTypes = TreeNodeTypes(
        simpleNodeTypes = setOf(
            "constructor_declaration",
            "method_declaration",
            "local_function_statement",
            "accessor_declaration"
        ),
        nestedNodeTypes = setOf(
            NestedNodeType(
                baseNodeType = "variable_declarator",
                childNodeCount = 3,
                childNodePosition = 2,
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
            "parameter"
        )
    )

    override val messageChainsNodeTypes = TreeNodeTypes(
        simpleNodeTypes = setOf(
            "invocation_expression",
            "member_access_expression"
        )
    )

    override val messageChainsCallNodeTypes = TreeNodeTypes(
        simpleNodeTypes = setOf(
            "invocation_expression"
        )
    )
}
