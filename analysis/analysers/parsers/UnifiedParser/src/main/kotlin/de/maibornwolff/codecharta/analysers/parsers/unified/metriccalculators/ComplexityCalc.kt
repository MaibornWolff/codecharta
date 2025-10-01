package de.maibornwolff.codecharta.analysers.parsers.unified.metriccalculators

import de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes.AvailableFunctionMetrics
import de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes.MetricNodeTypes
import de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes.TreeNodeTypes

// first, we calculate complexity as only function_complexity and later add logic_complexity to improve performance as:
// complexity = logic_complexity + function_complexity
class ComplexityCalc(val nodeTypeProvider: MetricNodeTypes) : MetricPerFileCalc, MetricPerFunctionCalc() {
    override val metric = AvailableFunctionMetrics.COMPLEXITY

    override fun processMetricForNode(params: CalculationContext) {
        // nothing needed as we update the complexity per function with the normal complexity
    }

    override fun calculateMetricForNode(params: CalculationContext): Int {
        return getComplexityForAllowedNodeTypes(params, nodeTypeProvider.logicComplexityNodeTypes)
    }

    fun calculateFunctionComplexityForNode(params: CalculationContext): Int {
        return getComplexityForAllowedNodeTypes(params, nodeTypeProvider.functionComplexityNodeTypes)
    }

    private fun getComplexityForAllowedNodeTypes(params: CalculationContext, allowedNodeTypes: TreeNodeTypes): Int {
        val node = params.node
        val nodeType = params.nodeType

        updateInFunctionStatus(node, nodeType, params.startRow, params.endRow, nodeTypeProvider)

        if (params.shouldIgnoreNode(node, nodeType)) {
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
