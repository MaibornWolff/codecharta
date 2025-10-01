package de.maibornwolff.codecharta.analysers.parsers.unified.metriccalculators

import de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes.AvailableFunctionMetrics
import de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes.MetricNodeTypes
import org.treesitter.TSNode

class RealLinesOfCodeCalc(val nodeTypeProvider: MetricNodeTypes) : MetricPerFileCalc, MetricPerFunctionCalc() {
    override val metric = AvailableFunctionMetrics.RLOC
    private var lastCountedLine = -1
    private var isFirstOrLastNodeInFunction = false

    private var functionBodyStartRow = -1
    private var functionBodyStartColumn = -1
    private var functionBodyEndRow = -1
    private var functionBodyEndColumn = -1

    override fun processMetricForNode(params: CalculationContext) {
        // nothing needed as we update the rloc per function with the normal rloc
    }

    override fun calculateMetricForNode(params: CalculationContext): Int {
        val node = params.node
        val nodeType = params.nodeType
        val startRow = params.startRow
        val endRow = params.endRow

        updateInFunctionStatusForRloc(node, nodeType, startRow, endRow, nodeTypeProvider, params.languageUsesBrackets)

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

        if (isInFunction && isInFunctionBodyForRloc()) {
            addToMetricForFunction(rlocForNode)
        }

        return rlocForNode
    }

    private fun isInFunctionBodyForRloc(): Boolean {
        return isInFunctionBody && !isFirstOrLastNodeInFunction
    }

    private fun updateInFunctionStatusForRloc(
        node: TSNode,
        nodeType: String,
        startRow: Int,
        endRow: Int,
        nodeTypeProvider: MetricNodeTypes,
        languageUsesBrackets: Boolean
    ) {
        updateInFunctionStatus(node, nodeType, startRow, endRow, nodeTypeProvider)

        if (isInFunction && isInFunctionBody) {
            val startCol = node.startPoint.column
            val endCol = node.endPoint.column

            if (isNodeTypeAllowed(node, nodeType, nodeTypeProvider.functionBodyNodeTypes)) {
                functionBodyStartRow = startRow
                functionBodyStartColumn = startCol
                functionBodyEndRow = endRow
                functionBodyEndColumn = endCol
            }

            // if language uses brackets for function body
            if (languageUsesBrackets) {
                val isFirstNode = (startRow == functionBodyStartRow && startCol == functionBodyStartColumn)
                val isLastNode = (endRow == functionBodyEndRow && endCol == functionBodyEndColumn)
                isFirstOrLastNodeInFunction = isFirstNode || isLastNode
            }
        } else {
            resetBoundaries()
            isFirstOrLastNodeInFunction = false
        }
    }

    private fun resetBoundaries() {
        functionBodyStartRow = -1
        functionBodyStartColumn = -1
        functionBodyEndRow = -1
        functionBodyEndColumn = -1
    }
}
