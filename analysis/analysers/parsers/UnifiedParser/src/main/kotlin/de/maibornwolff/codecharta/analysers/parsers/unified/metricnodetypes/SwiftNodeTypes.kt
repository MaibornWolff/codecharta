package de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes

class SwiftNodeTypes : MetricNodeTypes {
    override val logicComplexityNodeTypes = TreeNodeTypes(
        simpleNodeTypes = setOf(
            // if
            "if_statement",
            "guard_statement",
            // loop
            "for_statement",
            "while_statement",
            "repeat_while_statement",
            // case
            "switch_entry",
            // catch
            "catch_block",
            // defer
            "defer_statement"
        ),
        nestedNodeTypes = setOf(
            // logical binary operators
            NestedNodeType(
                baseNodeType = "infix_expression",
                childNodeFieldName = "operator",
                childNodeTypes = setOf("&&", "||")
            ),
            // nil-coalescing operators
            NestedNodeType(
                baseNodeType = "infix_expression",
                childNodeFieldName = "operator",
                childNodeTypes = setOf("??")
            )
        )
    )

    override val functionComplexityNodeTypes = TreeNodeTypes(
        simpleNodeTypes = setOf(
            "function_declaration",
            "init_declaration",
            "deinit_declaration",
            "closure_expression",
            "getter_effects",
            "setter_effects",
            "willSet_didSet_block"
        )
    )

    override val commentLineNodeTypes = TreeNodeTypes(
        simpleNodeTypes = setOf(
            "comment",
            "multiline_comment"
        )
    )

    override val numberOfFunctionsNodeTypes = TreeNodeTypes(
        simpleNodeTypes = setOf(
            "function_declaration",
            "init_declaration",
            "deinit_declaration",
            "closure_expression"
        )
    )

    override val functionBodyNodeTypes = TreeNodeTypes(
        simpleNodeTypes = setOf(
            "function_body",
            "code_block"
        )
    )

    override val functionParameterNodeTypes = TreeNodeTypes(
        simpleNodeTypes = setOf(
            "parameter"
        )
    )
}
