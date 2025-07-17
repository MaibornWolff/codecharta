package de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors

import de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes.PythonNodeTypes
import org.treesitter.TSNode
import org.treesitter.TreeSitterPython

class PythonCollector : MetricCollector(
    treeSitterLanguage = TreeSitterPython(),
    queryProvider = PythonNodeTypes()
) {
    override fun calculateRealLinesOfCodeForNode(node: TSNode, nodeType: String, startRow: Int, endRow: Int): Int {
        if (isNodePartOfBlockCommentString(nodeType)) return 0
        return super.calculateRealLinesOfCodeForNode(node, nodeType, startRow, endRow)
    }

    // TODO: add case of multiline strings
    private fun isNodePartOfBlockCommentString(nodeType: String): Boolean {
        return nodeType == "string" ||
            nodeType == "string_start" ||
            nodeType == "string_content" ||
            nodeType == "string_end"
    }
}
