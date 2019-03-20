package de.maibornwolff.codecharta.importer.sourcecodeparser.metricwriters

import de.maibornwolff.codecharta.importer.sourcecodeparser.metrics.FileMetrics

interface MetricWriter {
  fun generate(metricsMap: MutableMap<String, FileMetrics>, allMetrics: Set<String>)
}