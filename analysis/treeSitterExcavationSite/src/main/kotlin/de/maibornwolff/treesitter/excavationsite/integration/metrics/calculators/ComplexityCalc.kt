package de.maibornwolff.treesitter.excavationsite.integration.metrics.calculators

import de.maibornwolff.treesitter.excavationsite.integration.metrics.domain.AvailableFunctionMetrics
import de.maibornwolff.treesitter.excavationsite.integration.metrics.domain.CalculationContext
import de.maibornwolff.treesitter.excavationsite.integration.metrics.ports.MetricNodeTypes
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.NodeTypeMatcher
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeNodeTypes

// first, we calculate complexity as only function_complexity and later add logic_complexity to improve performance as:
// complexity = logic_complexity + function_complexity
class ComplexityCalc(val nodeTypeProvider: MetricNodeTypes) :
    MetricPerFunctionCalc(),
    MetricPerFileCalc {
    override val metric = AvailableFunctionMetrics.COMPLEXITY

    override fun processMetricForNode(nodeContext: CalculationContext) {
        // nothing needed as we update the complexity per function with the normal complexity
    }

    override fun calculateMetricForNode(nodeContext: CalculationContext): Int =
        getComplexityForAllowedNodeTypes(nodeContext, nodeTypeProvider.logicComplexityNodeTypes)

    fun calculateFunctionComplexityForNode(nodeContext: CalculationContext): Int =
        getComplexityForAllowedNodeTypes(nodeContext, nodeTypeProvider.functionComplexityNodeTypes)

    private fun getComplexityForAllowedNodeTypes(nodeContext: CalculationContext, allowedNodeTypes: TreeNodeTypes): Int {
        val node = nodeContext.node
        val nodeType = nodeContext.nodeType

        updateInFunctionStatus(nodeContext, nodeTypeProvider)

        if (nodeContext.shouldIgnoreNode(node, nodeType)) {
            return 0
        }

        return if (NodeTypeMatcher.isNodeTypeAllowed(node, nodeType, allowedNodeTypes)) {
            if (isInFunction && isInFunctionBody) addToMetricForFunction(1)
            1
        } else {
            0
        }
    }
}
