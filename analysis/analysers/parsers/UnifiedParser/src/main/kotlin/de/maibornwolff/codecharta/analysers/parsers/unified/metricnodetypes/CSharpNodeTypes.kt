package de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes

class CSharpNodeTypes : MetricNodeTypes {
    override val complexityNodeTypes = TreeNodeTypes(
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
            "catch_clause",
            // function
            "constructor_declaration",
            "method_declaration",
            "lambda_expression",
            "local_function_statement",
            "accessor_declaration"
        ),
        nestedNodeTypes = setOf(
            NestedNodeType(
                baseNodeType = "binary_expression",
                childNodeFieldName = "operator",
                childNodeTypes = setOf("&&", "||", "??")
            )
        )
    )

    override val commentLineNodeTypes = TreeNodeTypes(
        simpleNodeTypes = setOf(
            "comment"
        )
    )
}
