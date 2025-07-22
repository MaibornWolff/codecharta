package de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes

class CNodeTypes : MetricNodeTypes {
    override val complexityNodeTypes = TreeNodeTypes(
        simpleNodeTypes = setOf(
            // if
            "if_statement",
            // loop
            "do_statement",
            "for_statement",
            "while_statement",
            // conditional
            "conditional_expression",
            // case
            "case_statement",
            // catch
            "seh_except_clause",
            // function
            "function_definition",
            "abstract_function_declarator",
            "function_declarator"
        ),
        nestedNodeTypes = setOf(
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
}
