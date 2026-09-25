package de.maibornwolff.treesitter.excavationsite.integration.metrics.adapters

import de.maibornwolff.treesitter.excavationsite.integration.metrics.ports.MetricNodeTypes
import de.maibornwolff.treesitter.excavationsite.shared.domain.LanguageDefinition
import de.maibornwolff.treesitter.excavationsite.shared.domain.Metric
import de.maibornwolff.treesitter.excavationsite.shared.domain.MetricCondition
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.NestedNodeType
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeNodeTypes
import kotlin.collections.iterator

/**
 * Adapts a LanguageDefinition to the MetricNodeTypes interface.
 *
 * Builds TreeNodeTypes for each metric category by scanning the nodeMetrics map.
 * Converts feature-local MetricCondition to infrastructure-level NestedNodeType.
 */
class LanguageDefinitionMetricsAdapter(definition: LanguageDefinition) : MetricNodeTypes {
    override val logicComplexityNodeTypes: TreeNodeTypes
    override val functionComplexityNodeTypes: TreeNodeTypes
    override val commentLineNodeTypes: TreeNodeTypes
    override val numberOfFunctionsNodeTypes: TreeNodeTypes
    override val functionBodyNodeTypes: TreeNodeTypes
    override val functionParameterNodeTypes: TreeNodeTypes
    override val messageChainsNodeTypes: TreeNodeTypes
    override val messageChainsCallNodeTypes: TreeNodeTypes

    init {
        val logicSimple = mutableSetOf<String>()
        val logicNested = mutableSetOf<NestedNodeType>()
        val functionComplexitySimple = mutableSetOf<String>()
        val commentSimple = mutableSetOf<String>()
        val commentNested = mutableSetOf<NestedNodeType>()
        val functionSimple = mutableSetOf<String>()
        val functionNested = mutableSetOf<NestedNodeType>()
        val functionBodySimple = mutableSetOf<String>()
        val parameterSimple = mutableSetOf<String>()
        val chainSimple = mutableSetOf<String>()
        val chainCallSimple = mutableSetOf<String>()

        for ((nodeType, metrics) in definition.nodeMetrics) {
            for (metric in metrics) {
                when (metric) {
                    is Metric.LogicComplexity -> logicSimple.add(nodeType)
                    is Metric.LogicComplexityConditional -> {
                        toNestedNodeType(nodeType, metric.condition)?.let { logicNested.add(it) }
                    }
                    is Metric.FunctionComplexity -> functionComplexitySimple.add(nodeType)
                    is Metric.CommentLine -> commentSimple.add(nodeType)
                    is Metric.CommentLineConditional -> {
                        toNestedNodeType(nodeType, metric.condition)?.let { commentNested.add(it) }
                    }
                    is Metric.Function -> functionSimple.add(nodeType)
                    is Metric.FunctionConditional -> {
                        toNestedNodeType(nodeType, metric.condition)?.let { functionNested.add(it) }
                    }
                    is Metric.FunctionBody -> functionBodySimple.add(nodeType)
                    is Metric.Parameter -> parameterSimple.add(nodeType)
                    is Metric.MessageChain -> chainSimple.add(nodeType)
                    is Metric.MessageChainCall -> chainCallSimple.add(nodeType)
                }
            }
        }

        logicComplexityNodeTypes = TreeNodeTypes(
            logicSimple,
            logicNested.takeIf { it.isNotEmpty() }
        )
        functionComplexityNodeTypes = TreeNodeTypes(functionComplexitySimple)
        commentLineNodeTypes = TreeNodeTypes(
            commentSimple,
            commentNested.takeIf { it.isNotEmpty() }
        )
        numberOfFunctionsNodeTypes = TreeNodeTypes(
            functionSimple,
            functionNested.takeIf { it.isNotEmpty() }
        )
        functionBodyNodeTypes = TreeNodeTypes(functionBodySimple)
        functionParameterNodeTypes = TreeNodeTypes(parameterSimple)
        messageChainsNodeTypes = TreeNodeTypes(chainSimple)
        messageChainsCallNodeTypes = TreeNodeTypes(chainCallSimple)
    }

    /**
     * Converts a feature-local MetricCondition to an infrastructure-level NestedNodeType.
     */
    private fun toNestedNodeType(nodeType: String, condition: MetricCondition): NestedNodeType? = when (condition) {
        is MetricCondition.Always -> null
        is MetricCondition.ChildFieldMatches -> NestedNodeType(
            baseNodeType = nodeType,
            childNodeFieldName = condition.fieldName,
            childNodeTypes = condition.allowedValues
        )
        is MetricCondition.ChildPositionMatches -> NestedNodeType(
            baseNodeType = nodeType,
            childNodeCount = condition.requiredChildCount,
            childNodePosition = condition.position,
            childNodeTypes = condition.allowedTypes
        )
    }
}
