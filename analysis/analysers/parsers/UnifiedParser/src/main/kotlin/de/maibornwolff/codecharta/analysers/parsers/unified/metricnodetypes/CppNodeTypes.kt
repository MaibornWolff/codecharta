package de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes

import org.treesitter.TSNode

class CppNodeTypes : MetricNodeTypes {
    override val logicComplexityNodeTypes = TreeNodeTypes(
        simpleNodeTypes = setOf(
            // if
            "if_statement",
            // loop
            "do_statement",
            "for_statement",
            "while_statement",
            "for_range_loop",
            // conditional
            "conditional_expression",
            // case
            "case_statement",
            // catch
            "catch_clause",
            "seh_except_clause"
        ),
        nestedNodeTypes = setOf(
            // logical binary
            NestedNodeType(
                baseNodeType = "binary_expression",
                childNodeFieldName = "operator",
                childNodeTypes = setOf("&&", "||", "and", "or", "xor")
            )
        )
    )

    override val functionComplexityNodeTypes = TreeNodeTypes(
        simpleNodeTypes = setOf(
            "lambda_expression",
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
        ),
        nestedNodeTypes = setOf(
            NestedNodeType(
                baseNodeType = "init_declarator",
                childNodeFieldName = "value",
                childNodeTypes = setOf("lambda_expression")
            )
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
        private const val ABSTRACT_FUNCTION_DECLARATION_TYPE = "abstract_function_declarator"
        private const val LAMBDA_EXPRESSION = "lambda_expression"
        private const val FUNCTION_DECLARATION_TYPE = "function_declarator"
        private const val FUNCTION_DEFINITION_TYPE = "function_definition"

        // every lambda expression contains an abstract function declarator, which can be ignored
        fun shouldIgnoreAbstractFunctionInLambda(node: TSNode, nodeType: String): Boolean {
            return nodeType == ABSTRACT_FUNCTION_DECLARATION_TYPE && node.parent.type == LAMBDA_EXPRESSION
        }

        // every function definition contains a function declarator, which can be ignored
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
