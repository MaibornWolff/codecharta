package de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors

import de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes.RubyNodeTypes
import org.treesitter.TSNode
import org.treesitter.TreeSitterRuby

class RubyCollector : MetricCollector(
    treeSitterLanguage = TreeSitterRuby(),
    nodeTypeProvider = RubyNodeTypes()
) {
    override fun calculateComplexityForNode(node: TSNode, nodeType: String): Int {
        if (shouldIgnoreNodeTypeForComplexity(node, nodeType)) return 0
        return super.calculateComplexityForNode(node, nodeType)
    }

    override fun calculateRealLinesOfCodeForNode(node: TSNode, nodeType: String, startRow: Int, endRow: Int): Int {
        if (shouldIgnoreNodeTypeForRloc(nodeType)) return 0
        return super.calculateRealLinesOfCodeForNode(node, nodeType, startRow, endRow)
    }

    private fun shouldIgnoreNodeTypeForComplexity(node: TSNode, nodeType: String): Boolean {
        val rubyNodeTypes = nodeTypeProvider as RubyNodeTypes
        return rubyNodeTypes.shouldIgnoreChildWithEqualParentType(node, nodeType) ||
            rubyNodeTypes.shouldIgnoreElseNotInCaseStatement(node, nodeType)
    }

    private fun shouldIgnoreNodeTypeForRloc(nodeType: String): Boolean {
        val rubyNodeTypes = nodeTypeProvider as RubyNodeTypes
        return rubyNodeTypes.nodeTypesToIgnore.contains(nodeType)
    }
}
