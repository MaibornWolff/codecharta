package de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes

import org.treesitter.TSNode

class RubyNodeTypes : MetricNodeTypes {
    override val logicComplexityNodeTypes = TreeNodeTypes(
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
            "rescue"
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

    override val functionComplexityNodeTypes = TreeNodeTypes(
        simpleNodeTypes = setOf(
            "lambda",
            "method",
            "singleton_method"
        )
    )

    override val commentLineNodeTypes = TreeNodeTypes(
        simpleNodeTypes = setOf(
            "comment"
        )
    )

    override val numberOfFunctionsNodeTypes = TreeNodeTypes(
        simpleNodeTypes = setOf(
            "method",
            "singleton_method"
        ),
        nestedNodeTypes = setOf(
            NestedNodeType(
                baseNodeType = "assignment",
                childNodeFieldName = "right",
                childNodeTypes = setOf("lambda")
            )
        )
    )

    override val parameterOfFunctionNodeTypes = TreeNodeTypes(
        simpleNodeTypes = setOf(
            "identifier"
        )
    )

    companion object {
        // some node types equal their string literal in code, which is captured in a child node and can be ignored to prevent double counting
        fun shouldIgnoreChildWithEqualParentType(node: TSNode, nodeType: String): Boolean {
            if (nodeType == "if") {
                println()
            }
            return nodesWhereTypeEqualsCodeLiteral.contains(nodeType) && nodeType == node.parent.type
        }

        fun shouldIgnoreElseNotInCaseStatement(node: TSNode, nodeType: String): Boolean {
            return nodeType == "else" && node.parent.type != "case"
        }

        val nodeTypesToIgnore = setOf(
            "then"
        )

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
}
