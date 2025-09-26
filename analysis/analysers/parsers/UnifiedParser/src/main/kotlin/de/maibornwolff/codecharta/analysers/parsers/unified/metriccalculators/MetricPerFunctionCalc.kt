package de.maibornwolff.codecharta.analysers.parsers.unified.metriccalculators

import de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes.AvailableFunctionMetrics

interface MetricPerFunctionCalc : MetricCalc {
    val metric: AvailableFunctionMetrics

    fun processMetricForNode(params: CalculationContext)

    fun getMeasureMetricsForMetricType(): Map<String, Double> {
        val metricName = metric.metricName
        val metricsMap = mutableMapOf<String, Double>()

        metricsMap["max_${metricName}_per_function"] = getMaxMetricForFile().toDouble()
        metricsMap["min_${metricName}_per_function"] = getMinMetricForFile().toDouble()
        metricsMap["mean_${metricName}_per_function"] = getMeanMetricForFile()
        metricsMap["median_${metricName}_per_function"] = getMedianMetricForFile()
        return metricsMap
    }

    fun getMetricPerFunction(): List<Int>

    private fun getMaxMetricForFile(): Int {
        return getMetricPerFunction().max()
    }

    private fun getMinMetricForFile(): Int {
        return getMetricPerFunction().min()
    }

    private fun getMeanMetricForFile(): Double {
        val metrics = getMetricPerFunction()
        val nrofElements = metrics.lastIndex + 1
        return if (nrofElements == 0) {
            0.0
        } else {
            metrics.sum().toDouble() / nrofElements
        }
    }

    private fun getMedianMetricForFile(): Double {
        val metrics = getMetricPerFunction()
        if (metrics.isEmpty()) return 0.0
        val sorted = metrics.sorted()
        val size = sorted.size
        return if (size % 2 == 1) {
            sorted[size / 2].toDouble()
        } else {
            (sorted[size / 2 - 1] + sorted[size / 2]) / 2.0
        }
    }
}
