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
            // conditional
            "conditional",
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

    override val functionBodyNodeTypes = TreeNodeTypes(
        simpleNodeTypes = setOf(
            "body_statement"
        )
    )

    override val functionParameterNodeTypes = TreeNodeTypes(
        simpleNodeTypes = setOf(
            "identifier"
        )
    )

    companion object {
        private const val FUNCTION_NAME_TYPE = "identifier"
        private const val FUNCTION_DECLARATION_TYPE = "method"
        private const val CASE_STATEMENT_TYPE = "case"
        private const val ELSE_STATEMENT_TYPE = "else"
        private const val THEN_DELIMITER = "then"

        // some node types equal their string literal in code, which is captured in a child node and can be ignored to prevent double counting
        fun shouldIgnoreChildWithEqualParentType(node: TSNode, nodeType: String): Boolean {
            return nodesWhereTypeEqualsCodeLiteral.contains(nodeType) && nodeType == node.parent.type
        }

        fun shouldIgnoreNodeTypeForRloc(nodeType: String): Boolean {
            return nodeType == THEN_DELIMITER
        }

        fun shouldIgnoreElseNotInCaseStatement(node: TSNode, nodeType: String): Boolean {
            return nodeType == ELSE_STATEMENT_TYPE && node.parent.type != CASE_STATEMENT_TYPE
        }

        fun shouldIgnoreMethodNameAsParameter(node: TSNode, nodeType: String): Boolean {
            return nodeType == FUNCTION_NAME_TYPE && node.parent.type == FUNCTION_DECLARATION_TYPE
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

    override val messageChainsNodeTypes = TreeNodeTypes(
        simpleNodeTypes = setOf()
    )
}
