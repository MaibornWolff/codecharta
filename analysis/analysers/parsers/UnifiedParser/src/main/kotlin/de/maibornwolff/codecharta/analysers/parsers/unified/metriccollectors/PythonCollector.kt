package de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors

import de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes.PythonNodeTypes
import org.treesitter.TSNode
import org.treesitter.TreeSitterPython

class PythonCollector : MetricCollector(
    treeSitterLanguage = TreeSitterPython(),
    nodeTypeProvider = PythonNodeTypes()
) {
    override fun calculateRealLinesOfCodeForNode(node: TSNode, nodeType: String, startRow: Int, endRow: Int): Int {
        if (shouldIgnoreNodeType(node, nodeType)) return 0
        return super.calculateRealLinesOfCodeForNode(node, nodeType, startRow, endRow)
    }

    override fun countWholeNodeLength(node: TSNode): Boolean {
        return node.childCount == 0 || (node.type == "string" && node.parent.childCount != 1)
    }

    private fun shouldIgnoreNodeType(node: TSNode, nodeType: String): Boolean {
        val pyNodeTypes = nodeTypeProvider as PythonNodeTypes
        return pyNodeTypes.nodeTypesToIgnore.contains(nodeType) ||
            pyNodeTypes.shouldIgnoreStringInBlockComment(node, nodeType) ||
            pyNodeTypes.shouldIgnoreNodeStartingWithComment(node)
    }
}
