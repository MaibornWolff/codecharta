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

        val isChainNode = isNodeTypeAllowed(node, nodeType, nodeTypeProvider.messageChainsNodeTypes)

        if (!isChainNode) {
            currentChainCallCount = 0
            chainAlreadyCounted = false
            return 0
        }

        val parent = node.parent
        val parentIsChainNode = isNodeTypeAllowed(parent, parent.type, nodeTypeProvider.messageChainsNodeTypes)

        if (!parentIsChainNode) {
            currentChainCallCount = 0
            chainAlreadyCounted = false
        }

        if (isCallNode(nodeType)) {
            currentChainCallCount++

            if (currentChainCallCount >= MESSAGE_CHAINS_THRESHOLD && !chainAlreadyCounted) {
                chainAlreadyCounted = true
                return 1
            }
        }

        return 0
    }

    private fun isCallNode(nodeType: String): Boolean {
        return nodeTypeProvider.messageChainsCallNodeTypes.simpleNodeTypes.contains(nodeType)
    }
}
