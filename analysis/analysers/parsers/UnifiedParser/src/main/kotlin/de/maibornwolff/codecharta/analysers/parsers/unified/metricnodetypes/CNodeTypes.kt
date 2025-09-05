package de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes

import org.treesitter.TSNode

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
            // logical binary
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

    // every function definition contains a function declarator, so the inner declarator can be ignored
    fun shouldIgnoreFnDeclaratorInFnDefinition(node: TSNode, nodeType: String): Boolean {
        return nodeType == "function_declarator" && node.parent.type == "function_definition"
    }
}
