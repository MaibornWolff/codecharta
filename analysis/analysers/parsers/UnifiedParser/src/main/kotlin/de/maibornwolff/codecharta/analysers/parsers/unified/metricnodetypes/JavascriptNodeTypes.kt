package de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes

import org.treesitter.TSNode

class JavascriptNodeTypes : MetricNodeTypes {
    override val logicComplexityNodeTypes = TreeNodeTypes(
        simpleNodeTypes = setOf(
            // if
            "if_statement",
            // loop
            "do_statement",
            "for_statement",
            "while_statement",
            "for_in_statement",
            // conditional
            "ternary_expression",
            // case
            "switch_case",
            "switch_default",
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
            "function_declaration",
            "generator_function_declaration",
            "arrow_function",
            "generator_function",
            "method_definition",
            "class_static_block",
            "function_expression"
        )
    )

    override val commentLineNodeTypes = TreeNodeTypes(
        simpleNodeTypes = setOf(
            "comment",
            "html_comment"
        )
    )

    override val numberOfFunctionsNodeTypes = TreeNodeTypes(
        simpleNodeTypes = setOf(
            "function_declaration",
            "generator_function_declaration",
            "method_definition",
            "function_expression"
        ),
        nestedNodeTypes = setOf(
            NestedNodeType(
                baseNodeType = "variable_declarator",
                childNodeFieldName = "value",
                childNodeTypes = setOf("arrow_function")
            )
        )
    )

    override val functionBodyNodeTypes = TreeNodeTypes(
        simpleNodeTypes = setOf(
            "statement_block"
        )
    )

    override val functionParameterNodeTypes = TreeNodeTypes(
        simpleNodeTypes = setOf(
            "identifier"
        )
    )

    companion object {
        private const val FUNCTION_NAME_TYPE = "identifier"
        private const val FUNCTION_DECLARATION_TYPE = "function_declaration"

        fun shouldIgnoreFunctionNameAsParameter(node: TSNode, nodeType: String): Boolean {
            return nodeType == FUNCTION_NAME_TYPE && node.parent.type == FUNCTION_DECLARATION_TYPE
        }
    }
}
