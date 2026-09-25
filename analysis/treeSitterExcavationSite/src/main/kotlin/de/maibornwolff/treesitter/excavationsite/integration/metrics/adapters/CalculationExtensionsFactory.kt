package de.maibornwolff.treesitter.excavationsite.integration.metrics.adapters

import de.maibornwolff.treesitter.excavationsite.shared.domain.CalculationConfig
import de.maibornwolff.treesitter.excavationsite.shared.domain.CalculationExtensions
import de.maibornwolff.treesitter.excavationsite.shared.domain.IgnoreRule
import de.maibornwolff.treesitter.excavationsite.shared.domain.LeafNodeRule
import org.treesitter.TSNode

/**
 * Factory that converts declarative CalculationConfig to executable CalculationExtensions.
 *
 * This factory implements the hexagonal architecture pattern by keeping the rule evaluation
 * logic in the adapters layer while language definitions remain purely declarative.
 */
object CalculationExtensionsFactory {
    private const val EXPRESSION_STATEMENT = "expression_statement"

    fun fromConfig(config: CalculationConfig): CalculationExtensions = CalculationExtensions(
        hasFunctionBodyStartOrEndNode = config.hasFunctionBodyStartOrEndNode,
        ignoreNodeForComplexity = buildIgnoreFunction(config.ignoreForComplexity),
        ignoreNodeForCommentLines = buildIgnoreFunction(config.ignoreForCommentLines),
        ignoreNodeForNumberOfFunctions = buildIgnoreFunction(config.ignoreForNumberOfFunctions),
        ignoreNodeForRealLinesOfCode = buildIgnoreFunction(config.ignoreForRloc),
        ignoreNodeForParameterOfFunctions = buildIgnoreFunction(config.ignoreForParameters),
        ignoreNodeForMessageChainCall = buildIgnoreFunction(config.ignoreForMessageChainCall),
        countNodeAsLeafNode = buildLeafNodeFunction(config.countAsLeafNode)
    )

    private fun buildIgnoreFunction(rules: List<IgnoreRule>): (TSNode, String) -> Boolean {
        if (rules.isEmpty()) {
            return { _, _ -> false }
        }
        return { node, nodeType ->
            rules.any { rule -> evaluateRule(rule, node, nodeType) }
        }
    }

    private fun evaluateRule(rule: IgnoreRule, node: TSNode, nodeType: String): Boolean = when (rule) {
        is IgnoreRule.TypeWithParentType -> {
            nodeType == rule.nodeType && node.parent.type == rule.parentType
        }
        is IgnoreRule.TypeInSet -> {
            rule.types.contains(nodeType)
        }
        is IgnoreRule.TypeEqualsParentTypeWhenInSet -> {
            rule.types.contains(nodeType) && nodeType == node.parent.type
        }
        is IgnoreRule.SingleChildOfParentWithType -> {
            nodeType == rule.nodeType && node.parent.childCount == 1
        }
        is IgnoreRule.TypeWhenParentTypeIsNot -> {
            nodeType == rule.nodeType && node.parent.type != rule.requiredParentType
        }
        is IgnoreRule.FirstChildIsDocstring -> {
            val childNode = node.getChild(0)
            if (childNode.isNull) {
                false
            } else {
                childNode.type == EXPRESSION_STATEMENT && childNode.childCount == 1
            }
        }
    }

    private fun buildLeafNodeFunction(rule: LeafNodeRule?): (TSNode) -> Boolean {
        if (rule == null) {
            return { false }
        }
        return { node ->
            when (rule) {
                is LeafNodeRule.WhenParentHasMultipleChildren -> {
                    node.type == rule.nodeType && node.parent.childCount != 1
                }
            }
        }
    }
}
