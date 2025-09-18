package de.maibornwolff.codecharta.analysers.parsers.unified.metriccalculators

import de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes.MetricNodeTypes

class ComplexityCalculator(val nodeTypeProvider: MetricNodeTypes) : MetricCalculator {
    override fun calculateMetricForNode(params: CalculationContext): Int {
        val node = params.node
        val nodeType = params.nodeType

        if (params.shouldIgnoreNode(node, nodeType)) return 0

        return if (isNodeTypeAllowed(node, nodeType, nodeTypeProvider.complexityNodeTypes)) 1 else 0
    }
}
