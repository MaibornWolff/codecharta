package de.maibornwolff.codecharta.analysers.parsers.unified.metriccalculators

import de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes.MetricNodeTypes

class MessageChainsCalc(val nodeTypeProvider: MetricNodeTypes) : MetricPerFileCalc {
    private var currentChainCallCount = 0
    private var chainAlreadyCounted = false

    companion object {
        private const val MESSAGE_CHAINS_THRESHOLD = 4
    }

    override fun calculateMetricForNode(params: CalculationContext): Int {
        val node = params.node
        val nodeType = params.nodeType

        if (params.shouldIgnoreNode(node, nodeType)) return 0

        if (!isChainNodeType(nodeType)) {
            currentChainCallCount = 0
            chainAlreadyCounted = false
            return 0
        }

        if (!isChainNodeType(node.parent.type)) {
            currentChainCallCount = 0
            chainAlreadyCounted = false
        }

        if (nodeType == "call_expression") { //TODO: make this language independent
            currentChainCallCount++

            if (currentChainCallCount >= MESSAGE_CHAINS_THRESHOLD && !chainAlreadyCounted) {
                chainAlreadyCounted = true
                return 1
            }
        }

        return 0
    }

    private fun isChainNodeType(nodeType: String): Boolean {
        return nodeType == "call_expression" || nodeType == "member_expression"
    }
}
