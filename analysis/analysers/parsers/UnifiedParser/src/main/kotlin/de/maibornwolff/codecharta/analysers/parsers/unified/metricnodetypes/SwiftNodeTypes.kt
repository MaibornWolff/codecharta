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
            "defer_statement",
            // nil-coalescing
            "nil_coalescing_expression",
            // logical operators
            "conjunction_expression",
            "disjunction_expression",
            // ternary
            "ternary_expression",
            // property observers
            "willset_clause",
            "didset_clause"
        )
    )

    override val functionComplexityNodeTypes = TreeNodeTypes(
        simpleNodeTypes = setOf(
            "function_declaration",
            "init_declaration",
            "deinit_declaration",
            "lambda_literal",
            "subscript_declaration",
            "computed_getter",
            "computed_setter"
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
            "computed_getter",
            "computed_setter"
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

    override val messageChainsNodeTypes = TreeNodeTypes(
        simpleNodeTypes = setOf()
    )
}
