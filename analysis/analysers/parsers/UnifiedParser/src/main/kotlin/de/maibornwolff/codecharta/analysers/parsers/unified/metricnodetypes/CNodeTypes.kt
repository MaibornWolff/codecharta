package de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes

import org.treesitter.TSNode

class CNodeTypes : MetricNodeTypes {
    override val logicComplexityNodeTypes = TreeNodeTypes(
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
            "seh_except_clause"
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
            "function_definition",
            "abstract_function_declarator",
            "function_declarator"
        )
    )

    override val commentLineNodeTypes = TreeNodeTypes(
        simpleNodeTypes = setOf(
            "comment"
        )
    )

    override val numberOfFunctionsNodeTypes = TreeNodeTypes(
        simpleNodeTypes = setOf(
            "function_definition"
        )
    )

    override val functionBodyNodeTypes = TreeNodeTypes(
        simpleNodeTypes = setOf(
            "compound_statement"
        )
    )

    override val functionParameterNodeTypes = TreeNodeTypes(
        simpleNodeTypes = setOf(
            "parameter_declaration"
        )
    )

    companion object {
        private const val FUNCTION_DECLARATION_TYPE = "function_declarator"
        private const val FUNCTION_DEFINITION_TYPE = "function_definition"

        // every function definition contains a function declarator, so the inner declarator can be ignored
        fun shouldIgnoreFnDeclaratorInFnDefinition(node: TSNode, nodeType: String): Boolean {
            return nodeType == FUNCTION_DECLARATION_TYPE && node.parent.type == FUNCTION_DEFINITION_TYPE
        }
    }

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
