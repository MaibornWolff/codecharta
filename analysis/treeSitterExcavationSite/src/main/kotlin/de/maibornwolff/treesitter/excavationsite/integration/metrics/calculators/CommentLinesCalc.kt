package de.maibornwolff.treesitter.excavationsite.integration.metrics.calculators

import de.maibornwolff.treesitter.excavationsite.integration.metrics.domain.CalculationContext
import de.maibornwolff.treesitter.excavationsite.integration.metrics.ports.MetricNodeTypes
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.NodeTypeMatcher

class CommentLinesCalc(val nodeTypeProvider: MetricNodeTypes) : MetricPerFileCalc {
    private var lastCountedLine = -1

    override fun calculateMetricForNode(nodeContext: CalculationContext): Int {
        val node = nodeContext.node
        val nodeType = nodeContext.nodeType
        val startRow = nodeContext.startRow
        val endRow = nodeContext.endRow

        if (nodeContext.shouldIgnoreNode(node, nodeType)) return 0

        if (startRow > lastCountedLine && NodeTypeMatcher.isNodeTypeAllowed(node, nodeType, nodeTypeProvider.commentLineNodeTypes)) {
            lastCountedLine = startRow
            return lastOccupiedRow(node, startRow, endRow) - startRow + 1
        }
        return 0
    }
}
