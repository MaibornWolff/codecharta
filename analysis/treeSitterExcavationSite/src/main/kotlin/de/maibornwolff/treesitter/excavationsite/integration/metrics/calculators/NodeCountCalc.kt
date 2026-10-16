package de.maibornwolff.treesitter.excavationsite.integration.metrics.calculators

import de.maibornwolff.treesitter.excavationsite.integration.metrics.domain.CalculationContext
import de.maibornwolff.treesitter.excavationsite.shared.domain.Metric
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.orNull
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.NodeTypeMatcher
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeNodeTypes

/** Counts the nodes of the counted types; with [countsDistinctNames] a name counts once, see [Metric.Counted]. */
class NodeCountCalc(private val countedNodeTypes: TreeNodeTypes, private val countsDistinctNames: Boolean = false) : MetricPerFileCalc {
    private val countedNames = mutableSetOf<String>()

    override fun calculateMetricForNode(nodeContext: CalculationContext): Int {
        val node = nodeContext.node
        val nodeType = nodeContext.nodeType

        if (nodeContext.shouldIgnoreNode(node, nodeType)) return 0
        if (!NodeTypeMatcher.isNodeTypeAllowed(node, nodeType, countedNodeTypes)) return 0
        if (!countsDistinctNames) return 1

        val qualifiedName = qualifiedNameOf(node) ?: return 1
        return if (countedNames.add(qualifiedName)) 1 else 0
    }

    private fun qualifiedNameOf(node: SyntaxNode): String? {
        val name = nameOf(node) ?: return null
        val qualifiers = generateSequence(node.parent.orNull()) { it.parent.orNull() }.mapNotNull { nameOf(it) }.toList()
        return (qualifiers.reversed() + name).joinToString(QUALIFIER_SEPARATOR)
    }

    // Names compare without regard to case or quotes, as most databases compare them
    private fun nameOf(node: SyntaxNode): String? = node
        .getChildByFieldName(NAME_FIELD)
        .orNull()
        ?.text
        ?.lowercase()
        ?.filterNot { it in QUOTES }

    companion object {
        private const val NAME_FIELD = "name"
        private const val QUALIFIER_SEPARATOR = "/"
        private const val QUOTES = "\"`[]"
    }
}
