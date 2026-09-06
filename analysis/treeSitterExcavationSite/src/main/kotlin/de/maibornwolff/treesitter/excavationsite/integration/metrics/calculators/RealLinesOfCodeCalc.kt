package de.maibornwolff.treesitter.excavationsite.integration.metrics.calculators

import de.maibornwolff.treesitter.excavationsite.integration.metrics.domain.AvailableFunctionMetrics
import de.maibornwolff.treesitter.excavationsite.integration.metrics.domain.CalculationContext
import de.maibornwolff.treesitter.excavationsite.integration.metrics.ports.MetricNodeTypes
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.NodeTypeMatcher

class RealLinesOfCodeCalc(val nodeTypeProvider: MetricNodeTypes) :
    MetricPerFunctionCalc(),
    MetricPerFileCalc {
    override val metric = AvailableFunctionMetrics.RLOC
    private var lastCountedLine = -1
    private var isFirstOrLastNodeInFunction = false
    private var isStartOfFunctionBody = false
    private var isFirstAllowedNodeInFunctionBody = false
    private var functionBodyBoundariesSet = false

    private var functionBodyStartRow = -1
    private var functionBodyStartColumn = -1
    private var functionBodyEndRow = -1
    private var functionBodyEndColumn = -1

    override fun processMetricForNode(nodeContext: CalculationContext) {
        // nothing needed as we update the rloc per function with the normal rloc
    }

    override fun calculateMetricForNode(nodeContext: CalculationContext): Int {
        val node = nodeContext.node
        val nodeType = nodeContext.nodeType
        val startRow = nodeContext.startRow
        val endRow = nodeContext.endRow

        updateInFunctionStatusForRloc(nodeContext, nodeTypeProvider)

        if (nodeContext.shouldIgnoreNode(node, nodeType) ||
            NodeTypeMatcher.isNodeTypeAllowed(node, nodeType, nodeTypeProvider.commentLineNodeTypes)
        ) {
            return 0
        }
        var rlocForNode = 0
        var rlocForFunctionAdder = 0

        if (startRow > lastCountedLine) {
            lastCountedLine = startRow
            rlocForNode++
        } else if (isStartOfFunctionBody) {
            rlocForFunctionAdder = 1
        }

        if (endRow > lastCountedLine && (node.childCount == 0 || nodeContext.countNodeAsLeafNode(node))) {
            lastCountedLine = endRow
            rlocForNode += endRow - startRow
        }

        if (isInFunction && isInFunctionBodyAndAllowedNode()) {
            addToRlocPerFunction(rlocForNode, rlocForFunctionAdder)
        }

        return rlocForNode
    }

    private fun addToRlocPerFunction(rlocForNode: Int, rlocForFunctionAdder: Int) {
        var additionalRlocForFunction = 0
        if (isFirstAllowedNodeInFunctionBody) {
            additionalRlocForFunction = rlocForFunctionAdder
            isFirstAllowedNodeInFunctionBody = false
            isStartOfFunctionBody = false
        }
        if (!isStartOfFunctionBody) {
            addToMetricForFunction(rlocForNode + additionalRlocForFunction)
        }
    }

    private fun isInFunctionBodyAndAllowedNode(): Boolean = isInFunctionBody && !isFirstOrLastNodeInFunction

    private fun updateInFunctionStatusForRloc(nodeContext: CalculationContext, nodeTypeProvider: MetricNodeTypes) {
        val node = nodeContext.node
        val nodeType = nodeContext.nodeType
        val startRow = nodeContext.startRow
        val endRow = nodeContext.endRow
        val functionBodyUsesBrackets = nodeContext.functionBodyUsesBrackets

        updateInFunctionStatus(nodeContext, nodeTypeProvider)

        if (isStartOfFunctionBody) {
            isFirstAllowedNodeInFunctionBody = true
        }

        if (isInFunction && isInFunctionBody) {
            val startCol = node.startPoint.column
            val endCol = node.endPoint.column

            if (NodeTypeMatcher.isNodeTypeAllowed(node, nodeType, nodeTypeProvider.functionBodyNodeTypes) &&
                !functionBodyBoundariesSet
            ) {
                setFunctionBodyBoundaries(startRow, startCol, endRow, endCol)
            } else if (functionBodyUsesBrackets) {
                val isFirstNode = (startRow == functionBodyStartRow && startCol == functionBodyStartColumn)
                val isLastNode = (endRow == functionBodyEndRow && endCol == functionBodyEndColumn)

                isFirstOrLastNodeInFunction = isFirstNode || isLastNode
            }
        } else {
            resetBoundaries()
            isFirstOrLastNodeInFunction = false
        }
    }

    private fun setFunctionBodyBoundaries(startRow: Int, startCol: Int, endRow: Int, endCol: Int) {
        functionBodyBoundariesSet = true
        isStartOfFunctionBody = true
        functionBodyStartRow = startRow
        functionBodyStartColumn = startCol
        functionBodyEndRow = endRow
        functionBodyEndColumn = endCol
        updateFunctionEndPos(endRow, endCol)
    }

    private fun resetBoundaries() {
        functionBodyBoundariesSet = false
        functionBodyStartRow = -1
        functionBodyStartColumn = -1
        functionBodyEndRow = -1
        functionBodyEndColumn = -1
    }
}
