package de.maibornwolff.codecharta.importer.sourcecodeparser.common.core

data class FileSummary(val name: String, val path: String, private val metrics: MetricCollection) {

    operator fun get(metricKey: Metric): Int = metrics[metricKey]
}
