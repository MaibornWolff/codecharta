package de.maibornwolff.codecharta.analysers.parsers.unified.metriccalculators

import de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes.MetricNodeTypes

class RealLinesOfCodeCalc(val nodeTypeProvider: MetricNodeTypes) : MetricPerFileCalc {
    private var lastCountedLine = -1

    override fun calculateMetricForNode(params: CalculationContext): Int {
        val node = params.node
        val nodeType = params.nodeType
        val startRow = params.startRow
        val endRow = params.endRow

        if (params.shouldIgnoreNode(node, nodeType) ||
            isNodeTypeAllowed(node, nodeType, nodeTypeProvider.commentLineNodeTypes)
        ) {
            return 0
        }
        var rlocForNode = 0

        if (startRow > lastCountedLine) {
            lastCountedLine = startRow
            rlocForNode++
        }

        if (endRow > lastCountedLine && (node.childCount == 0 || params.countNodeAsLeafNode(node))) {
            lastCountedLine = endRow
            rlocForNode += endRow - startRow
        }

        return rlocForNode
    }
}
