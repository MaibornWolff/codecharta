package de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.source.SourceDescriptor

data class DetailedMetricTableSum(
        val sourceDescriptor: SourceDescriptor,
        val metrics: MetricMap
) : Iterable<Map.Entry<MetricType, Int>> {
    override fun iterator() = metrics.iterator()

    operator fun get(metricKey: MetricType): Int = metrics[metricKey]
}
