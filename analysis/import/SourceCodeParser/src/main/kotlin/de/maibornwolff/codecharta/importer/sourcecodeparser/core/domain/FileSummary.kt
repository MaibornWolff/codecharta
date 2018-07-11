package de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.raw.Language

data class FileSummary(val name: String, val path: String, val language: Language, private val metrics: MetricCollection): Iterable<Map.Entry<MetricType, Int>> {
    override fun iterator() = metrics.iterator()

    operator fun get(metricKey: MetricType): Int = metrics[metricKey]
}
