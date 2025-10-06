package de.maibornwolff.codecharta.analysers.parsers.unified.metriccalculators

import de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes.AvailableFunctionMetrics
import de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes.MetricNodeTypes
import org.treesitter.TSNode
import kotlin.math.round

abstract class MetricPerFunctionCalc : MetricCalc {
    abstract val metric: AvailableFunctionMetrics

    protected var isInFunction = false
    private var idOfCurrentFunction = -1
    private var endRowOfLastFunction = -1
    private var endColumnOfLastFunction = -1

    protected var isInFunctionBody = false

    private val metricPerFunction = mutableListOf<Int>()

    abstract fun processMetricForNode(params: CalculationContext)

    protected fun updateInFunctionStatus(
        node: TSNode,
        nodeType: String,
        startRow: Int,
        endRow: Int,
        nodeTypeProvider: MetricNodeTypes
    ) {
        if (isInFunction) {
            if (startRow > endRowOfLastFunction || (startRow == endRowOfLastFunction && node.startPoint.column > endColumnOfLastFunction)) {
                isInFunction = false
                isInFunctionBody = false
            }

            if (!isInFunctionBody && isNodeTypeAllowed(node, nodeType, nodeTypeProvider.functionBodyNodeTypes)) {
                isInFunctionBody = true
            }
        }

        if (!isInFunction && isNodeTypeAllowed(node, nodeType, nodeTypeProvider.numberOfFunctionsNodeTypes)) {
            isInFunction = true
            idOfCurrentFunction++
            metricPerFunction.add(0)
            endRowOfLastFunction = endRow
            endColumnOfLastFunction = node.endPoint.column
        }
    }

    fun addToMetricForFunction(value: Int) {
        metricPerFunction[idOfCurrentFunction] += value
    }

    fun getMeasureMetricsForMetricType(): Map<String, Double> {
        val metricName = metric.metricName
        val metricsMap = mutableMapOf<String, Double>()

        metricsMap["max_${metricName}_per_function"] = getMaxMetricForFile().toDouble()
        metricsMap["min_${metricName}_per_function"] = getMinMetricForFile().toDouble()
        metricsMap["mean_${metricName}_per_function"] = getMeanMetricForFile()
        metricsMap["median_${metricName}_per_function"] = getMedianMetricForFile()
        return metricsMap
    }

    fun getMetricPerFunction(): List<Int> {
        return metricPerFunction
    }

    fun updateFunctionEndPos(endRow: Int, endColumn: Int) {
        endRowOfLastFunction = endRow
        endColumnOfLastFunction = endColumn
    }

    private fun getMaxMetricForFile(): Int {
        return getMetricPerFunction().maxOrNull() ?: 0
    }

    private fun getMinMetricForFile(): Int {
        return getMetricPerFunction().minOrNull() ?: 0
    }

    private fun getMeanMetricForFile(): Double {
        val metrics = getMetricPerFunction()
        val nrofElements = metrics.lastIndex + 1
        return if (nrofElements == 0) {
            0.0
        } else {
            val mean = metrics.sum().toDouble() / nrofElements
            (round(mean * 100) / 100)
        }
    }

    private fun getMedianMetricForFile(): Double {
        val metrics = getMetricPerFunction()
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
