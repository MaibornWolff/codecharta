package de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain

data class FileSummary(val name: String, val path: String, private val metrics: MetricCollection) {

    operator fun get(metricKey: MetricType): Int = metrics[metricKey]
}
