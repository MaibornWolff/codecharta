package de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes

import org.treesitter.TSNode

class RubyNodeTypes : MetricNodeTypes {
    override val complexityNodeTypes = TreeNodeTypes(
        simpleNodeTypes = setOf(
            // if
            "if",
            "elsif",
            // loop
            "for",
            "until",
            "while",
            "do_block",
            // case
            "when",
            "else",
            // catch
            "rescue",
            // function
            "lambda",
            "method",
            "singleton_method"
        ),
        nestedNodeTypes = setOf(
            // logical binary
            NestedNodeType(
                baseNodeType = "binary",
                childNodeFieldName = "operator",
                childNodeTypes = setOf("&&", "||", "and", "or")
            )
        )
    )

    override val commentLineNodeTypes = TreeNodeTypes(
        simpleNodeTypes = setOf(
            "comment"
        )
    )

    // TODO: fill up
    override val numberOfFunctionsNodeTypes = TreeNodeTypes(
        simpleNodeTypes = setOf()
    )

    val nodeTypesToIgnore = setOf(
        "then"
    )

    // some node types equal their string literal in code, which is captured in a child node and can be ignored to prevent double counting
    fun shouldIgnoreChildWithEqualParentType(node: TSNode, nodeType: String): Boolean {
        return nodesWhereTypeEqualsCodeLiteral.contains(nodeType) && nodeType == node.parent.type
    }

    fun shouldIgnoreElseNotInCaseStatement(node: TSNode, nodeType: String): Boolean {
        return nodeType == "else" && node.parent.type != "case"
    }

    private val nodesWhereTypeEqualsCodeLiteral = setOf(
        "if",
        "elsif",
        "for",
        "until",
        "while",
        "when",
        "else",
        "rescue"
    )
}
