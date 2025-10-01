package de.maibornwolff.codecharta.analysers.parsers.unified.metriccalculators

import de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes.AvailableFunctionMetrics
import de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes.MetricNodeTypes

class ParametersPerFunctionCalc(val nodeTypeProvider: MetricNodeTypes) : MetricPerFunctionCalc() {
    override val metric = AvailableFunctionMetrics.PARAMETERS

    override fun processMetricForNode(params: CalculationContext) {
        val node = params.node
        val nodeType = params.nodeType
        val startRow = params.startRow
        val endRow = params.endRow

        updateInFunctionStatus(node, nodeType, startRow, endRow, nodeTypeProvider)

        if (params.shouldIgnoreNode(node, nodeType)) return

        if (isInFunction && !isInFunctionBody && isNodeTypeAllowed(node, nodeType, nodeTypeProvider.functionParameterNodeTypes)) {
            addToMetricForFunction(1)
        }
    }
}
