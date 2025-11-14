package de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes

class ObjectiveCNodeTypes : MetricNodeTypes {
    override val logicComplexityNodeTypes = TreeNodeTypes(
        simpleNodeTypes = setOf(
            // if
            "if_statement",
            // loop
            "for_statement",
            "while_statement",
            "do_statement",
            // case
            "case_statement",
            // catch
            "@catch",
            // ternary
            "conditional_expression"
        ),
        nestedNodeTypes = setOf(
            // logical binary operators
            NestedNodeType(
                baseNodeType = "&&",
                parentNodeType = "binary_expression"
            ),
            NestedNodeType(
                baseNodeType = "||",
                parentNodeType = "binary_expression"
            )
        )
    )

    override val functionComplexityNodeTypes = TreeNodeTypes(
        simpleNodeTypes = setOf(
            // C functions
            "function_definition",
            // Blocks (Objective-C closures)
            "block_expression"
        )
    )

    override val commentLineNodeTypes = TreeNodeTypes(
        simpleNodeTypes = setOf(
            "comment"
        )
    )

    override val numberOfFunctionsNodeTypes = TreeNodeTypes(
        simpleNodeTypes = setOf(
            // C functions
            "function_definition",
            // Objective-C methods
            "method_definition"
        )
    )

    override val functionBodyNodeTypes = TreeNodeTypes(
        simpleNodeTypes = setOf(
            "compound_statement"
        )
    )

    override val functionParameterNodeTypes = TreeNodeTypes(
        simpleNodeTypes = setOf(
            // C function parameters
            "parameter_declaration",
            // Objective-C method parameters
            "keyword_declarator"
        )
    )

    override val messageChainsNodeTypes = TreeNodeTypes(
        simpleNodeTypes = setOf(
            // C-style function calls and field access
            "call_expression",
            "field_expression",
            // Objective-C message sends
            "message_expression"
        )
    )

    override val messageChainsCallNodeTypes = TreeNodeTypes(
        simpleNodeTypes = setOf(
            // C-style function calls
            "call_expression",
            // Objective-C message sends
            "message_expression"
        )
    )
}
