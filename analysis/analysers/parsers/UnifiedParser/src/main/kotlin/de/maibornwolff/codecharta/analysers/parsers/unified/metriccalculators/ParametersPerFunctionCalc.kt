package de.maibornwolff.codecharta.analysers.parsers.unified.metriccalculators

import de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes.AvailableFunctionMetrics
import de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes.MetricNodeTypes

class ParametersPerFunctionCalc(val nodeTypeProvider: MetricNodeTypes) : MetricPerFunctionCalc() {
    override val metric = AvailableFunctionMetrics.PARAMETERS

    override fun processMetricForNode(nodeContext: CalculationContext) {
        val node = nodeContext.node
        val nodeType = nodeContext.nodeType

        updateInFunctionStatus(nodeContext, nodeTypeProvider)

        if (isInFunction &&
            !isInFunctionBody &&
            isNodeTypeAllowed(node, nodeType, nodeTypeProvider.functionParameterNodeTypes) &&
            !nodeContext.shouldIgnoreNode(node, nodeType)
        ) {
            addToMetricForFunction(1)
        }
    }
}
