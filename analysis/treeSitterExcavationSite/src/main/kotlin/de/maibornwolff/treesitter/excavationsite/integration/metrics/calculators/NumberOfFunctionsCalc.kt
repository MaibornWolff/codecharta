package de.maibornwolff.treesitter.excavationsite.integration.metrics.calculators

import de.maibornwolff.treesitter.excavationsite.integration.metrics.domain.CalculationContext
import de.maibornwolff.treesitter.excavationsite.integration.metrics.ports.MetricNodeTypes
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.NodeTypeMatcher

class NumberOfFunctionsCalc(val nodeTypeProvider: MetricNodeTypes) : MetricPerFileCalc {
    override fun calculateMetricForNode(nodeContext: CalculationContext): Int {
        val node = nodeContext.node
        val nodeType = nodeContext.nodeType

        if (nodeContext.shouldIgnoreNode(node, nodeType)) return 0

        return if (NodeTypeMatcher.isNodeTypeAllowed(node, nodeType, nodeTypeProvider.numberOfFunctionsNodeTypes)) 1 else 0
    }
}
