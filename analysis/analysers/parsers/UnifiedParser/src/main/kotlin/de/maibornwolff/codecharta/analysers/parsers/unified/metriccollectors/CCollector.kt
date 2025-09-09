package de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors

import de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes.CNodeTypes
import org.treesitter.TSNode
import org.treesitter.TreeSitterC

class CCollector : MetricCollector(
    treeSitterLanguage = TreeSitterC(),
    nodeTypeProvider = CNodeTypes()
) {
    override fun calculateComplexityForNode(node: TSNode, nodeType: String): Int {
        if (shouldIgnoreNodeType(node, nodeType)) return 0
        return super.calculateComplexityForNode(node, nodeType)
    }

    private fun shouldIgnoreNodeType(node: TSNode, nodeType: String): Boolean {
        val cNodeTypes = nodeTypeProvider as CNodeTypes
        return cNodeTypes.shouldIgnoreFnDeclaratorInFnDefinition(node, nodeType)
    }
}
