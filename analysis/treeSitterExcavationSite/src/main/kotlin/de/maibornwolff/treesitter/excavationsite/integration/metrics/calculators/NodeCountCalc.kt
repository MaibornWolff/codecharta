package de.maibornwolff.treesitter.excavationsite.integration.metrics.calculators

import de.maibornwolff.treesitter.excavationsite.integration.metrics.domain.CalculationContext
import de.maibornwolff.treesitter.excavationsite.shared.domain.Metric
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.NodeTypeMatcher
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeNodeTypes

/** Counts the nodes of the counted types; nodes with the same object key count once, see [Metric.Counted]. */
class NodeCountCalc(
    private val countedNodeTypes: TreeNodeTypes,
    private val objectKeyByNodeType: Map<String, (SyntaxNode) -> String?> = emptyMap()
) : MetricPerFileCalc {
    private val countedKeys = mutableSetOf<String>()

    override fun calculateMetricForNode(nodeContext: CalculationContext): Int {
        val node = nodeContext.node
        val nodeType = nodeContext.nodeType

        if (nodeContext.shouldIgnoreNode(node, nodeType)) return 0
        if (!NodeTypeMatcher.isNodeTypeAllowed(node, nodeType, countedNodeTypes)) return 0

        val objectKey = objectKeyByNodeType[nodeType]?.invoke(node) ?: return 1
        return if (countedKeys.add(objectKey)) 1 else 0
    }
}
