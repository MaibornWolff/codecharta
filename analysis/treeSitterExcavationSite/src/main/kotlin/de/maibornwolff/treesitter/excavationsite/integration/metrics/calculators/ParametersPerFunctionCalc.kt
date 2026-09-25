package de.maibornwolff.treesitter.excavationsite.integration.metrics.calculators

import de.maibornwolff.treesitter.excavationsite.integration.metrics.domain.AvailableFunctionMetrics
import de.maibornwolff.treesitter.excavationsite.integration.metrics.domain.CalculationContext
import de.maibornwolff.treesitter.excavationsite.integration.metrics.ports.MetricNodeTypes
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.NodeTypeMatcher

class ParametersPerFunctionCalc(val nodeTypeProvider: MetricNodeTypes) : MetricPerFunctionCalc() {
    override val metric = AvailableFunctionMetrics.PARAMETERS

    override fun processMetricForNode(nodeContext: CalculationContext) {
        val node = nodeContext.node
        val nodeType = nodeContext.nodeType

        updateInFunctionStatus(nodeContext, nodeTypeProvider)

        if (isInFunction &&
            !isInFunctionBody &&
            NodeTypeMatcher.isNodeTypeAllowed(node, nodeType, nodeTypeProvider.functionParameterNodeTypes) &&
            !nodeContext.shouldIgnoreNode(node, nodeType)
        ) {
            addToMetricForFunction(1)
        }
    }
}
