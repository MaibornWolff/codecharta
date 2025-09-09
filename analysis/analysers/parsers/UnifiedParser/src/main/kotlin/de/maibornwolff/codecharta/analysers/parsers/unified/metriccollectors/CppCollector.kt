package de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors

import de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes.CppNodeTypes
import org.treesitter.TSNode
import org.treesitter.TreeSitterCpp

class CppCollector : MetricCollector(
    treeSitterLanguage = TreeSitterCpp(),
    nodeTypeProvider = CppNodeTypes()
) {
    override fun calculateComplexityForNode(node: TSNode, nodeType: String): Int {
        if (shouldIgnoreNodeType(node, nodeType)) return 0
        return super.calculateComplexityForNode(node, nodeType)
    }

    private fun shouldIgnoreNodeType(node: TSNode, nodeType: String): Boolean {
        val cppNodeTypes = nodeTypeProvider as CppNodeTypes
        return cppNodeTypes.shouldIgnoreAbstractFunctionInLambda(node, nodeType) ||
            cppNodeTypes.shouldIgnoreFnDeclaratorInFnDefinition(node, nodeType)
    }
}
