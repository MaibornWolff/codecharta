package de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes

class ScalaNodeTypes : MetricNodeTypes {
    override val logicComplexityNodeTypes = TreeNodeTypes(
        simpleNodeTypes = setOf(
            // if
            "if_expression",
            // loop
            "while_expression",
            "do_while_expression",
            "for_expression",
            // match/case (pattern matching)
            "case_clause",
            // catch
            "catch_clause"
        ),
        nestedNodeTypes = setOf(
            // logical operators (&&, ||, &, |)
            NestedNodeType(
                baseNodeType = "infix_expression",
                childNodeFieldName = "operator",
                childNodeTypes = setOf("&&", "||", "&", "|")
            )
        )
    )

    override val functionComplexityNodeTypes = TreeNodeTypes(
        simpleNodeTypes = setOf(
            "function_definition",
            "function_declaration",
            "lambda_expression"
        )
    )

    override val commentLineNodeTypes = TreeNodeTypes(
        simpleNodeTypes = setOf(
            "comment",
            "block_comment"
        )
    )

    override val numberOfFunctionsNodeTypes = TreeNodeTypes(
        simpleNodeTypes = setOf(
            "function_definition",
            "function_declaration",
            "lambda_expression"
        )
    )

    override val functionBodyNodeTypes = TreeNodeTypes(
        simpleNodeTypes = setOf(
            "template_body",
            "block"
        )
    )

    override val functionParameterNodeTypes = TreeNodeTypes(
        simpleNodeTypes = setOf(
            "parameter",
            "class_parameter"
        )
    )

    override val messageChainsNodeTypes = TreeNodeTypes(
        simpleNodeTypes = setOf(
            "call_expression",
            "field_expression"
        )
    )

    override val messageChainsCallNodeTypes = TreeNodeTypes(
        simpleNodeTypes = setOf(
            "call_expression"
        )
    )
}
