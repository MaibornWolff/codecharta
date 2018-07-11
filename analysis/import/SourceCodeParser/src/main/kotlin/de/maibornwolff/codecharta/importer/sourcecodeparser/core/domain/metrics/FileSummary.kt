package de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.source.Language

data class FileSummary(
        val name: String,
        val path: String,
        val language: Language,
        val metrics: MetricMap
): Iterable<Map.Entry<MetricType, Int>> {
    override fun iterator() = metrics.iterator()

    operator fun get(metricKey: MetricType): Int = metrics[metricKey]
}
