package de.maibornwolff.codecharta.importer.sourcecodeparser.metricwriters

import de.maibornwolff.codecharta.importer.sourcecodeparser.metrics.FileMetricMap

interface MetricWriter {
    fun generate(metricsMap: MutableMap<String, FileMetricMap>, allMetrics: Set<String>)
}