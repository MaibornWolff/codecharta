package de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors

import de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes.RubyNodeTypes
import org.treesitter.TSNode
import org.treesitter.TreeSitterRuby

class RubyCollector : MetricCollector(
    treeSitterLanguage = TreeSitterRuby(),
    nodeTypeProvider = RubyNodeTypes()
) {
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

    override fun calculateComplexityForNode(node: TSNode, nodeType: String): Int {
        if (isTypeEqualToParentType(node, nodeType) || isElseNotInCaseStatement(node, nodeType)) return 0
        return super.calculateComplexityForNode(node, nodeType)
    }

    override fun calculateRealLinesOfCodeForNode(node: TSNode, nodeType: String, startRow: Int, endRow: Int): Int {
        if (shouldIgnoreNodeType(nodeType)) return 0
        return super.calculateRealLinesOfCodeForNode(node, nodeType, startRow, endRow)
    }

    private fun isTypeEqualToParentType(node: TSNode, nodeType: String): Boolean {
        return nodesWhereTypeEqualsCodeLiteral.contains(nodeType) && nodeType == node.parent.type
    }

    private fun isElseNotInCaseStatement(node: TSNode, nodeType: String): Boolean {
        return nodeType == "else" && node.parent.type != "case"
    }

    private fun shouldIgnoreNodeType(nodeType: String): Boolean {
        return nodeType == "then"
    }
}
