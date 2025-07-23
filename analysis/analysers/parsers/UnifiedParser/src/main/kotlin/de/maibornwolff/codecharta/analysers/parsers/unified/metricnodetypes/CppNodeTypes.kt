package de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes

class CppNodeTypes : MetricNodeTypes {
    override val complexityNodeTypes = TreeNodeTypes(
        simpleNodeTypes = setOf(
            // if
            "if_statement",
            // loop
            "do_statement",
            "for_statement",
            "while_statement",
            "for_range_loop",
            // conditional
            "conditional_expression",
            // case
            "case_statement",
            // catch
            "catch_clause",
            "seh_except_clause",
            // function
            "lambda_expression",
            "function_definition",
            "abstract_function_declarator",
            "function_declarator"
        ),
        nestedNodeTypes = setOf(
            // logical binary
            NestedNodeType(
                baseNodeType = "binary_expression",
                childNodeFieldName = "operator",
                childNodeTypes = setOf("&&", "||", "and", "or", "xor")
            )
        )
    )

    override val commentLineNodeTypes = TreeNodeTypes(
        simpleNodeTypes = setOf(
            "comment"
        )
    )
}
