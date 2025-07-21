package de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors

import de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes.PythonNodeTypes
import org.treesitter.TSNode
import org.treesitter.TreeSitterPython

class PythonCollector : MetricCollector(
    treeSitterLanguage = TreeSitterPython(),
    nodeTypeProvider = PythonNodeTypes()
) {
    override fun calculateRealLinesOfCodeForNode(node: TSNode, nodeType: String, startRow: Int, endRow: Int): Int {
        if (shouldIgnoreNodeType(node, nodeType) || doesNodeStartWithComment(node)) return 0
        return super.calculateRealLinesOfCodeForNode(node, nodeType, startRow, endRow)
    }

    private fun shouldIgnoreNodeType(node: TSNode, nodeType: String): Boolean {
        return nodeType == "string_start" ||
            nodeType == "string_content" ||
            nodeType == "string_end" ||
            (nodeType == "string" && node.parent.childCount == 1)
    }

    private fun doesNodeStartWithComment(node: TSNode): Boolean {
        val childNode = node.getChild(0)
        if (childNode.isNull) return false
        return childNode.type == "expression_statement" && childNode.childCount == 1
    }

    override fun countWholeNodeLength(node: TSNode): Boolean {
        return node.childCount == 0 || (node.type == "string" && node.parent.childCount != 1)
    }
}
