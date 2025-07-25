package de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes

import org.treesitter.TSNode

class PythonNodeTypes : MetricNodeTypes {
    override val complexityNodeTypes = TreeNodeTypes(
        simpleNodeTypes = setOf(
            // if
            "if_statement",
            "elif_clause",
            "if_clause",
            // loop
            "for_statement",
            "while_statement",
            "for_in_clause",
            // conditional
            "conditional_expression",
            "list",
            // logical binary
            "boolean_operator",
            // case label
            "case_pattern",
            // catch block
            "except_clause",
            // function
            "function_definition"
        ),
        nestedNodeTypes = setOf(
            // lambda needs to be complex to not be counted double as type of first child is also lambda
            NestedNodeType(
                baseNodeType = "lambda",
                childNodeCount = 4,
                childNodePosition = 0,
                childNodeTypes = setOf("lambda")
            )
        )
    )

    override val commentLineNodeTypes = TreeNodeTypes(
        simpleNodeTypes = setOf(
            "comment"
        ),
        nestedNodeTypes = setOf(
            // in python unassigned strings are used as block comments, meaning an expression that only has string as a child
            NestedNodeType(
                baseNodeType = "expression_statement",
                childNodeCount = 1,
                childNodePosition = 0,
                childNodeTypes = setOf("string")
            )
        )
    )

    val nodeTypesToIgnore = setOf(
        "string_start",
        "string_content",
        "string_end"
    )

    // as python doesn't use brackets a comment at the start of a function/class would result in wrong rloc
    fun shouldIgnoreNodeStartingWithComment(node: TSNode): Boolean {
        val childNode = node.getChild(0)
        if (childNode.isNull) return false
        return childNode.type == "expression_statement" && childNode.childCount == 1
    }

    fun shouldIgnoreStringInBlockComment(node: TSNode, nodeType: String): Boolean {
        return nodeType == "string" && node.parent.childCount == 1
    }
}
