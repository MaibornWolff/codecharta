package de.maibornwolff.treesitter.excavationsite.integration.metrics.adapters

import de.maibornwolff.treesitter.excavationsite.integration.metrics.ports.CountedNodeTypes
import de.maibornwolff.treesitter.excavationsite.integration.metrics.ports.MetricNodeTypes
import de.maibornwolff.treesitter.excavationsite.shared.domain.AvailableFileMetrics
import de.maibornwolff.treesitter.excavationsite.shared.domain.LanguageDefinition
import de.maibornwolff.treesitter.excavationsite.shared.domain.Metric
import de.maibornwolff.treesitter.excavationsite.shared.domain.MetricCondition
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeNodeTypes

/**
 * Adapts a LanguageDefinition to the MetricNodeTypes interface by sorting the node types of its nodeMetrics map
 * into one TreeNodeTypes per metric category.
 */
class LanguageDefinitionMetricsAdapter(definition: LanguageDefinition) : MetricNodeTypes {
    private val logicComplexity = NodeTypesBuilder()
    private val functionComplexity = NodeTypesBuilder()
    private val commentLine = NodeTypesBuilder()
    private val numberOfFunctions = NodeTypesBuilder()
    private val functionBody = NodeTypesBuilder()
    private val functionParameter = NodeTypesBuilder()
    private val messageChains = NodeTypesBuilder()
    private val messageChainsCall = NodeTypesBuilder()
    private val counted = mutableMapOf<AvailableFileMetrics, NodeTypesBuilder>()
    private val objectKeys = mutableMapOf<AvailableFileMetrics, MutableMap<String, (SyntaxNode) -> String?>>()

    init {
        for ((nodeType, metrics) in definition.nodeMetrics) {
            metrics.forEach { metric -> addToCategory(nodeType, metric) }
        }
    }

    override val logicComplexityNodeTypes: TreeNodeTypes = logicComplexity.build()
    override val functionComplexityNodeTypes: TreeNodeTypes = functionComplexity.build()
    override val commentLineNodeTypes: TreeNodeTypes = commentLine.build()
    override val numberOfFunctionsNodeTypes: TreeNodeTypes = numberOfFunctions.build()
    override val functionBodyNodeTypes: TreeNodeTypes = functionBody.build()
    override val functionParameterNodeTypes: TreeNodeTypes = functionParameter.build()
    override val messageChainsNodeTypes: TreeNodeTypes = messageChains.build()
    override val messageChainsCallNodeTypes: TreeNodeTypes = messageChainsCall.build()
    override val countedNodeTypes: Map<AvailableFileMetrics, CountedNodeTypes> = counted.mapValues { (fileMetric, builder) ->
        CountedNodeTypes(builder.build(), objectKeys[fileMetric].orEmpty())
    }

    private fun addToCategory(nodeType: String, metric: Metric) {
        when (metric) {
            is Metric.LogicComplexity -> logicComplexity.add(nodeType)
            is Metric.LogicComplexityConditional -> logicComplexity.add(nodeType, metric.condition)
            is Metric.FunctionComplexity -> functionComplexity.add(nodeType)
            is Metric.CommentLine -> commentLine.add(nodeType)
            is Metric.CommentLineConditional -> commentLine.add(nodeType, metric.condition)
            is Metric.Function -> numberOfFunctions.add(nodeType)
            is Metric.FunctionConditional -> numberOfFunctions.add(nodeType, metric.condition)
            is Metric.FunctionBody -> functionBody.add(nodeType)
            is Metric.FunctionBodyConditional -> functionBody.add(nodeType, metric.condition)
            is Metric.Parameter -> functionParameter.add(nodeType)
            is Metric.MessageChain -> messageChains.add(nodeType)
            is Metric.MessageChainCall -> messageChainsCall.add(nodeType)
            is Metric.Counted -> addToCount(nodeType, metric)
        }
    }

    private fun addToCount(nodeType: String, metric: Metric.Counted) {
        counted.getOrPut(metric.fileMetric) { NodeTypesBuilder() }.add(nodeType, metric.condition)
        objectKeys.getOrPut(metric.fileMetric) { mutableMapOf() }[nodeType] = metric.objectKey
    }

    private class NodeTypesBuilder {
        private val simple = mutableSetOf<String>()
        private val conditional = mutableMapOf<String, MutableList<MetricCondition>>()

        fun add(nodeType: String, condition: MetricCondition = MetricCondition.Always) {
            val isUnconditional = condition == MetricCondition.Always
            if (isUnconditional) simple.add(nodeType) else conditional.getOrPut(nodeType) { mutableListOf() }.add(condition)
        }

        fun build(): TreeNodeTypes = TreeNodeTypes(simple, conditional)
    }
}
