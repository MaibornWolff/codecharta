package de.maibornwolff.treesitter.excavationsite.integration.metrics.calculators

import de.maibornwolff.treesitter.excavationsite.integration.metrics.domain.AvailableFunctionMetrics
import de.maibornwolff.treesitter.excavationsite.integration.metrics.domain.CalculationContext
import de.maibornwolff.treesitter.excavationsite.integration.metrics.ports.MetricNodeTypes
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.NodeTypeMatcher
import org.treesitter.TSNode
import kotlin.math.round

abstract class MetricPerFunctionCalc {
    abstract val metric: AvailableFunctionMetrics

    protected var isInFunction = false
    private var idOfCurrentFunction = -1
    private var endRowOfLastFunction = -1
    private var endColumnOfLastFunction = -1

    protected var isInFunctionBody = false

    private val metricPerFunction = mutableListOf<Int>()

    abstract fun processMetricForNode(nodeContext: CalculationContext)

    protected fun updateInFunctionStatus(nodeContext: CalculationContext, nodeTypeProvider: MetricNodeTypes) {
        val node = nodeContext.node
        val nodeType = node.type
        val startRow = nodeContext.startRow
        val endRow = nodeContext.endRow

        if (isInFunction) {
            checkLeavingFunction(startRow, node)
            checkEnteringFunctionBody(node, nodeType, nodeTypeProvider)
        }

        if (!isInFunction && NodeTypeMatcher.isNodeTypeAllowed(node, nodeType, nodeTypeProvider.numberOfFunctionsNodeTypes)) {
            handleEnteringNextFunction(endRow, node)
        }
    }

    private fun checkLeavingFunction(startRow: Int, node: TSNode) {
        if (startRow > endRowOfLastFunction ||
            (startRow == endRowOfLastFunction && node.startPoint.column > endColumnOfLastFunction)
        ) {
            isInFunction = false
            isInFunctionBody = false
        }
    }

    private fun checkEnteringFunctionBody(node: TSNode, nodeType: String, nodeTypeProvider: MetricNodeTypes) {
        if (!isInFunctionBody && NodeTypeMatcher.isNodeTypeAllowed(node, nodeType, nodeTypeProvider.functionBodyNodeTypes)) {
            isInFunctionBody = true
        }
    }

    private fun handleEnteringNextFunction(endRow: Int, node: TSNode) {
        isInFunction = true
        idOfCurrentFunction++
        metricPerFunction.add(0)
        endRowOfLastFunction = endRow
        endColumnOfLastFunction = node.endPoint.column
    }

    fun addToMetricForFunction(value: Int) {
        metricPerFunction[idOfCurrentFunction] += value
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

    fun updateFunctionEndPos(endRow: Int, endColumn: Int) {
        endRowOfLastFunction = endRow
        endColumnOfLastFunction = endColumn
    }

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
