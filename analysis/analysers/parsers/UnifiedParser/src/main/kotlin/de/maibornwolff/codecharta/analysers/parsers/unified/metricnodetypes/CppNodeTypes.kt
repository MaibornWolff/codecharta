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

    override val parameterOfFunctionNodeTypes = TreeNodeTypes(
        simpleNodeTypes = setOf(
            "parameter_declaration"
        )
    )

    companion object {
        // every lambda expression contains an abstract function declarator, which can be ignored
        fun shouldIgnoreAbstractFunctionInLambda(node: TSNode, nodeType: String): Boolean {
            return nodeType == "abstract_function_declarator" && node.parent.type == "lambda_expression"
        }

        // every function definition contains a function declarator, which can be ignored
        fun shouldIgnoreFnDeclaratorInFnDefinition(node: TSNode, nodeType: String): Boolean {
            return nodeType == "function_declarator" && node.parent.type == "function_definition"
        }
    }
}
