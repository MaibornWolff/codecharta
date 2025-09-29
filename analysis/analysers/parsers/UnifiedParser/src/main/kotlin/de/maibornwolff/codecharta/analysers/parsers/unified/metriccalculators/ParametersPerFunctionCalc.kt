package de.maibornwolff.codecharta.analysers.parsers.unified.metriccalculators

import de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes.AvailableFunctionMetrics
import de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes.MetricNodeTypes

class ParametersPerFunctionCalc(val nodeTypeProvider: MetricNodeTypes) : MetricPerFunctionCalc {
    override val metric = AvailableFunctionMetrics.PARAMETERS

    var isInFunctionParameterList = false
    var idOfCurrentFunction = -1
    var endRowOfLastFunction = -1
    var endColumnOfLastFunction = -1

    val functionsToNrofParams = mutableListOf<Int>()

    override fun getMetricPerFunction(): List<Int> {
        return functionsToNrofParams
    }

    override fun processMetricForNode(params: CalculationContext) {
        val node = params.node
        val nodeType = params.nodeType
        val startRow = params.startRow
        val endRow = params.endRow

        if (isInFunctionParameterList &&
            startRow > endRowOfLastFunction ||
            (startRow == endRowOfLastFunction && node.startPoint.column > endColumnOfLastFunction)
        ) {
            isInFunctionParameterList = false
        }

        if (!isInFunctionParameterList && isNodeTypeAllowed(node, nodeType, nodeTypeProvider.functionParameterListNodeTypes)) {
            isInFunctionParameterList = true
            idOfCurrentFunction++
            functionsToNrofParams.add(0)
            endRowOfLastFunction = endRow
            endColumnOfLastFunction = node.endPoint.column
        }

        if (params.shouldIgnoreNode(node, nodeType)) return

        if (isInFunctionParameterList && isNodeTypeAllowed(node, nodeType, nodeTypeProvider.parameterOfFunctionNodeTypes)) {
            functionsToNrofParams[idOfCurrentFunction]++
        }
    }
}
