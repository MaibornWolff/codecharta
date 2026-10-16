package de.maibornwolff.treesitter.excavationsite.integration.metrics.adapters

import de.maibornwolff.treesitter.excavationsite.integration.metrics.ports.MetricNodeTypes
import de.maibornwolff.treesitter.excavationsite.shared.domain.AvailableFileMetrics
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
    override val countedNodeTypes: Map<AvailableFileMetrics, TreeNodeTypes>

    init {
        val logicSimple = mutableSetOf<String>()
        val logicNested = mutableSetOf<NestedNodeType>()
        val functionComplexitySimple = mutableSetOf<String>()
        val commentSimple = mutableSetOf<String>()
        val commentNested = mutableSetOf<NestedNodeType>()
        val functionSimple = mutableSetOf<String>()
        val functionNested = mutableSetOf<NestedNodeType>()
        val functionBodySimple = mutableSetOf<String>()
        val functionBodyNested = mutableSetOf<NestedNodeType>()
        val parameterSimple = mutableSetOf<String>()
        val chainSimple = mutableSetOf<String>()
        val chainCallSimple = mutableSetOf<String>()
        val countedSimple = mutableMapOf<AvailableFileMetrics, MutableSet<String>>()
        val countedNested = mutableMapOf<AvailableFileMetrics, MutableSet<NestedNodeType>>()

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
                    is Metric.FunctionBodyConditional -> {
                        toNestedNodeType(nodeType, metric.condition)?.let { functionBodyNested.add(it) }
                    }
                    is Metric.Parameter -> parameterSimple.add(nodeType)
                    is Metric.MessageChain -> chainSimple.add(nodeType)
                    is Metric.MessageChainCall -> chainCallSimple.add(nodeType)
                    is Metric.Counted -> {
                        val nested = toNestedNodeType(nodeType, metric.condition)
                        if (nested == null) {
                            countedSimple.getOrPut(metric.fileMetric) { mutableSetOf() }.add(nodeType)
                        } else {
                            countedNested.getOrPut(metric.fileMetric) { mutableSetOf() }.add(nested)
                        }
                    }
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
        functionBodyNodeTypes = TreeNodeTypes(
            functionBodySimple,
            functionBodyNested.takeIf { it.isNotEmpty() }
        )
        functionParameterNodeTypes = TreeNodeTypes(parameterSimple)
        messageChainsNodeTypes = TreeNodeTypes(chainSimple)
        messageChainsCallNodeTypes = TreeNodeTypes(chainCallSimple)
        countedNodeTypes = (countedSimple.keys + countedNested.keys).associateWith { fileMetric ->
            TreeNodeTypes(countedSimple[fileMetric].orEmpty(), countedNested[fileMetric]?.takeIf { it.isNotEmpty() })
        }
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
        is MetricCondition.AnyChildMatches -> NestedNodeType(
            baseNodeType = nodeType,
            childNodeTypes = condition.allowedTypes,
            matchesAnyChild = true
        )
        is MetricCondition.ParentMatches -> NestedNodeType(
            baseNodeType = nodeType,
            parentNodeTypes = condition.allowedTypes
        )
        is MetricCondition.ChildTextMatches -> NestedNodeType(
            baseNodeType = nodeType,
            childNodeTypes = setOf(condition.childType),
            childNodeTexts = condition.allowedTexts
        )
        is MetricCondition.AllOf -> NestedNodeType(
            baseNodeType = nodeType,
            allOf = condition.conditions.mapNotNull { toNestedNodeType(nodeType, it) }
        )
        is MetricCondition.ChildTextDiffers -> NestedNodeType(
            baseNodeType = nodeType,
            childNodeTypes = setOf(condition.childType),
            childNodeTexts = condition.excludedTexts,
            excludesChildNodeTexts = true
        )
    }
}
