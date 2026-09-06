package de.maibornwolff.treesitter.excavationsite.integration.metrics.calculators

import de.maibornwolff.treesitter.excavationsite.integration.metrics.domain.CalculationContext
import de.maibornwolff.treesitter.excavationsite.integration.metrics.ports.MetricNodeTypes
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.NodeTypeMatcher

class MessageChainsCalc(val nodeTypeProvider: MetricNodeTypes) : MetricPerFileCalc {
    private var currentChainCallCount = 0
    private var chainAlreadyCounted = false

    companion object {
        private const val MESSAGE_CHAINS_THRESHOLD = 4
    }

    override fun calculateMetricForNode(nodeContext: CalculationContext): Int {
        val node = nodeContext.node
        val nodeType = nodeContext.nodeType

        if (nodeContext.shouldIgnoreNode(node, nodeType)) return 0

        val isChainNode = NodeTypeMatcher.isNodeTypeAllowed(node, nodeType, nodeTypeProvider.messageChainsNodeTypes)

        if (!isChainNode) {
            currentChainCallCount = 0
            chainAlreadyCounted = false
            return 0
        }

        val parent = node.parent
        val parentIsChainNode = NodeTypeMatcher.isNodeTypeAllowed(parent, parent.type, nodeTypeProvider.messageChainsNodeTypes)

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

    private fun isCallNode(nodeType: String): Boolean = nodeTypeProvider.messageChainsCallNodeTypes.simpleNodeTypes.contains(nodeType)
}
