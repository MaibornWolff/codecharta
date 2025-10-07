package de.maibornwolff.codecharta.analysers.parsers.unified.metriccalculators

import de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes.AvailableFunctionMetrics
import de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes.MetricNodeTypes
import de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes.TreeNodeTypes

// first, we calculate complexity as only function_complexity and later add logic_complexity to improve performance as:
// complexity = logic_complexity + function_complexity
class ComplexityCalc(val nodeTypeProvider: MetricNodeTypes) : MetricPerFileCalc, MetricPerFunctionCalc() {
    override val metric = AvailableFunctionMetrics.COMPLEXITY

    override fun processMetricForNode(nodeContext: CalculationContext) {
        // nothing needed as we update the complexity per function with the normal complexity
    }

    override fun calculateMetricForNode(nodeContext: CalculationContext): Int {
        return getComplexityForAllowedNodeTypes(nodeContext, nodeTypeProvider.logicComplexityNodeTypes)
    }

    fun calculateFunctionComplexityForNode(nodeContext: CalculationContext): Int {
        return getComplexityForAllowedNodeTypes(nodeContext, nodeTypeProvider.functionComplexityNodeTypes)
    }

    private fun getComplexityForAllowedNodeTypes(nodeContext: CalculationContext, allowedNodeTypes: TreeNodeTypes): Int {
        val node = nodeContext.node
        val nodeType = nodeContext.nodeType

        updateInFunctionStatus(nodeContext, nodeTypeProvider)

        if (nodeContext.shouldIgnoreNode(node, nodeType)) {
            return 0
        }

        return if (isNodeTypeAllowed(node, nodeType, allowedNodeTypes)) {
            if (isInFunction && isInFunctionBody) addToMetricForFunction(1)
            1
        } else {
            0
        }
    }
}
