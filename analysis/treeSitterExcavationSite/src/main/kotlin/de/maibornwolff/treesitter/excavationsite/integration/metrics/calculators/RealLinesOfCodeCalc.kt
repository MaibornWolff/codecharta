package de.maibornwolff.treesitter.excavationsite.integration.metrics.calculators

import de.maibornwolff.treesitter.excavationsite.integration.metrics.domain.AvailableFunctionMetrics
import de.maibornwolff.treesitter.excavationsite.integration.metrics.domain.CalculationContext
import de.maibornwolff.treesitter.excavationsite.integration.metrics.ports.MetricNodeTypes
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.NodeTypeMatcher

class RealLinesOfCodeCalc(val nodeTypeProvider: MetricNodeTypes) :
    MetricPerFunctionCalc(),
    MetricPerFileCalc {
    override val metric = AvailableFunctionMetrics.RLOC
    private var lastCountedLine = -1
    private var isFirstOrLastNodeInFunction = false
    private var isStartOfFunctionBody = false
    private var isFirstAllowedNodeInFunctionBody = false
    private var lastLineGivenToFunction: LineGivenToFunction? = null

    private class LineGivenToFunction(val functionIndex: Int, val startRow: Int, val startColumn: Int)

    override fun processMetricForNode(nodeContext: CalculationContext) {
        // nothing needed as we update the rloc per function with the normal rloc
    }

    override fun calculateMetricForNode(nodeContext: CalculationContext): Int {
        val node = nodeContext.node
        val nodeType = nodeContext.nodeType
        val startRow = nodeContext.startRow
        val endRow = nodeContext.endRow

        val functionBeforeNode = currentFunction
        updateInFunctionStatusForRloc(nodeContext, nodeTypeProvider)
        if (currentFunction !== functionBeforeNode && currentFunction?.startByte == node.startByte) {
            takeBackLineOfNestedFunctionStart(node)
        }

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
            addToRlocPerFunction(node, rlocForNode, rlocForFunctionAdder)
        }

        return rlocForNode
    }

    private fun addToRlocPerFunction(node: SyntaxNode, rlocForNode: Int, rlocForFunctionAdder: Int) {
        var additionalRlocForFunction = 0
        if (isFirstAllowedNodeInFunctionBody) {
            additionalRlocForFunction = rlocForFunctionAdder
            isFirstAllowedNodeInFunctionBody = false
            isStartOfFunctionBody = false
        }
        if (!isStartOfFunctionBody && rlocForNode + additionalRlocForFunction > 0) {
            addToMetricForFunction(rlocForNode + additionalRlocForFunction)
            lastLineGivenToFunction = currentFunction?.let { LineGivenToFunction(it.index, node.startRow, node.startColumn) }
        }
    }

    private fun takeBackLineOfNestedFunctionStart(nestedFunction: SyntaxNode) {
        val line = lastLineGivenToFunction ?: return
        if (line.startRow == nestedFunction.startRow && line.startColumn == nestedFunction.startColumn) {
            addToMetricOfFunction(line.functionIndex, -1)
            lastLineGivenToFunction = null
        }
    }

    private fun isInFunctionBodyAndAllowedNode(): Boolean = isInFunctionBody && !isFirstOrLastNodeInFunction

    private fun updateInFunctionStatusForRloc(nodeContext: CalculationContext, nodeTypeProvider: MetricNodeTypes) {
        val node = nodeContext.node

        updateInFunctionStatus(nodeContext, nodeTypeProvider)

        if (isStartOfFunctionBody) {
            isFirstAllowedNodeInFunctionBody = true
        }

        val function = currentFunction
        val body = function?.body
        when {
            function == null || !function.isInBody -> isFirstOrLastNodeInFunction = false
            body == null -> enterFunctionBody(function, node)
            nodeContext.functionBodyUsesBrackets ->
                isFirstOrLastNodeInFunction = body.startsWith(node) || (body.isDelimited && body.endsWith(node))
        }
    }

    private fun enterFunctionBody(function: OpenFunction, body: SyntaxNode) {
        isStartOfFunctionBody = true
        isFirstOrLastNodeInFunction = false
        function.body = FunctionBodyBounds(body, isDelimitedOnBothSides(body))
        function.endRow = body.endRow
        function.endColumn = body.endColumn
    }

    private fun isDelimitedOnBothSides(body: SyntaxNode): Boolean {
        val opening = body.getChild(0)
        val closing = body.getChild(body.childCount - 1)
        return isToken(opening) && isToken(closing) && opening.text !in EXPRESSION_BODY_MARKERS
    }

    private fun isToken(node: SyntaxNode): Boolean = !node.isNull && node.childCount == 0

    companion object {
        private val EXPRESSION_BODY_MARKERS = setOf("=", "=>")
    }
}
