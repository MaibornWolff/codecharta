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
            // Some grammars (e.g. tree-sitter-rust doc comments) include the trailing newline in the
            // comment node, so its exclusive end point lands at column 0 of the next row. That row is
            // not part of the comment, so it must not be counted.
            val endsAtNextLineStart = node.endPoint.column == 0 && endRow > startRow
            val effectiveEndRow = if (endsAtNextLineStart) endRow - 1 else endRow
            return effectiveEndRow - startRow + 1
        }
        return 0
    }
}
