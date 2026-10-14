package de.maibornwolff.treesitter.excavationsite.integration.metrics.calculators

import de.maibornwolff.treesitter.excavationsite.integration.metrics.domain.AvailableFunctionMetrics
import de.maibornwolff.treesitter.excavationsite.integration.metrics.domain.CalculationContext
import de.maibornwolff.treesitter.excavationsite.integration.metrics.ports.MetricNodeTypes
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.NodeTypeMatcher
import kotlin.math.round

abstract class MetricPerFunctionCalc {
    abstract val metric: AvailableFunctionMetrics

    protected class OpenFunction(val index: Int, val startByte: Int, var endRow: Int, var endColumn: Int) {
        var isInBody = false
        var body: FunctionBodyBounds? = null

        fun hasEndedBefore(node: SyntaxNode): Boolean = node.startRow > endRow || (node.startRow == endRow && node.startColumn > endColumn)
    }

    protected class FunctionBodyBounds(body: SyntaxNode, val isDelimited: Boolean) {
        private val startRow = body.startRow
        private val startColumn = body.startColumn
        private val endRow = body.endRow
        private val endColumn = body.endColumn

        fun startsWith(node: SyntaxNode): Boolean = node.startRow == startRow && node.startColumn == startColumn

        fun endsWith(node: SyntaxNode): Boolean = node.endRow == endRow && node.endColumn == endColumn
    }

    private val openFunctions = ArrayDeque<OpenFunction>()

    protected val currentFunction: OpenFunction?
        get() = openFunctions.lastOrNull()

    protected val isInFunction: Boolean
        get() = openFunctions.isNotEmpty()

    protected val isInFunctionBody: Boolean
        get() = currentFunction?.isInBody == true

    private val metricPerFunction = mutableListOf<Int>()

    abstract fun processMetricForNode(nodeContext: CalculationContext)

    protected fun updateInFunctionStatus(nodeContext: CalculationContext, nodeTypeProvider: MetricNodeTypes) {
        val node = nodeContext.node
        val nodeType = node.type

        closeFunctionsEndedBefore(node)
        enterFunctionBodyIfReached(node, nodeType, nodeTypeProvider)

        if (NodeTypeMatcher.isNodeTypeAllowed(node, nodeType, nodeTypeProvider.numberOfFunctionsNodeTypes) && !isOpenedBy(node)) {
            openFunction(node)
        }
    }

    private fun closeFunctionsEndedBefore(node: SyntaxNode) {
        while (currentFunction?.hasEndedBefore(node) == true) {
            openFunctions.removeLast()
        }
    }

    private fun enterFunctionBodyIfReached(node: SyntaxNode, nodeType: String, nodeTypeProvider: MetricNodeTypes) {
        val function = currentFunction ?: return
        if (!function.isInBody && NodeTypeMatcher.isNodeTypeAllowed(node, nodeType, nodeTypeProvider.functionBodyNodeTypes)) {
            function.isInBody = true
        }
    }

    private fun isOpenedBy(node: SyntaxNode): Boolean = currentFunction?.startByte == node.startByte && currentFunction?.isInBody == false

    private fun openFunction(node: SyntaxNode) {
        openFunctions.addLast(OpenFunction(metricPerFunction.size, node.startByte, node.endRow, node.endColumn))
        metricPerFunction.add(0)
    }

    fun addToMetricForFunction(value: Int) {
        val function = currentFunction ?: return
        addToMetricOfFunction(function.index, value)
    }

    protected fun addToMetricOfFunction(index: Int, value: Int) {
        metricPerFunction[index] += value
    }

    fun getMeasureMetricsForMetricType(): Map<String, Double> {
        val metricName = metric.metricName
        val metrics = getMetricPerFunction()

        return mapOf(
            "max_${metricName}_per_function" to (metrics.maxOrNull() ?: 0).toDouble(),
            "min_${metricName}_per_function" to (metrics.minOrNull() ?: 0).toDouble(),
            "mean_${metricName}_per_function" to calculateMean(metrics),
            "median_${metricName}_per_function" to calculateMedian(metrics)
        )
    }

    fun getMetricPerFunction(): List<Int> = metricPerFunction

    private fun calculateMean(metrics: List<Int>): Double {
        if (metrics.isEmpty()) return 0.0
        val mean = metrics.sum().toDouble() / metrics.size
        return (round(mean * 100) / 100)
    }

    private fun calculateMedian(metrics: List<Int>): Double {
        if (metrics.isEmpty()) return 0.0
        val sorted = metrics.sorted()
        val size = sorted.size
        val median = if (size % 2 == 1) {
            sorted[size / 2].toDouble()
        } else {
            (sorted[size / 2 - 1] + sorted[size / 2]) / 2.0
        }
        return (round(median * 100) / 100)
    }
}
