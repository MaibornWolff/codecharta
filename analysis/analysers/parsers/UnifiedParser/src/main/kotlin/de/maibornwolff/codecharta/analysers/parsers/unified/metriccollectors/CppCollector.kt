package de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors

import de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes.CppNodeTypes
import org.treesitter.TSNode
import org.treesitter.TreeSitterCpp

class CppCollector : MetricCollector(
    treeSitterLanguage = TreeSitterCpp(),
    nodeTypeProvider = CppNodeTypes()
) {
    override fun calculateComplexityForNode(node: TSNode, nodeType: String): Int {
        if (isAbstractFunctionInLambda(node, nodeType) || isFnDeclarationInFnDefinition(node, nodeType)) return 0
        return super.calculateComplexityForNode(node, nodeType)
    }

    private fun isAbstractFunctionInLambda(node: TSNode, nodeType: String): Boolean {
        return nodeType == "abstract_function_declarator" && node.parent.type == "lambda_expression"
    }

    private fun isFnDeclarationInFnDefinition(node: TSNode, nodeType: String): Boolean {
        return nodeType == "function_declarator" && node.parent.type == "function_definition"
    }
}
