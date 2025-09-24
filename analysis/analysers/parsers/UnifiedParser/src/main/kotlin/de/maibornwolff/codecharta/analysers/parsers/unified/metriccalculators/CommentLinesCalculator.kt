package de.maibornwolff.codecharta.analysers.parsers.unified.metriccalculators

import de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes.MetricNodeTypes

class CommentLinesCalculator(val nodeTypeProvider: MetricNodeTypes) : MetricCalculator {
    private var lastCountedLine = -1

    override fun calculateMetricForNode(params: CalculationContext): Int {
        val node = params.node
        val nodeType = params.nodeType
        val startRow = params.startRow
        val endRow = params.endRow

        if (params.shouldIgnoreNode(node, nodeType)) return 0

        if (startRow > lastCountedLine && isNodeTypeAllowed(node, nodeType, nodeTypeProvider.commentLineNodeTypes)) {
            lastCountedLine = startRow
            return endRow - startRow + 1
        }
        return 0
    }
}
