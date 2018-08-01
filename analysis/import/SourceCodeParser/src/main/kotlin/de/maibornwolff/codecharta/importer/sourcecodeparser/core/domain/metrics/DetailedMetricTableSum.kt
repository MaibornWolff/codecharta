package de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.source.SourceDescriptor

data class DetailedMetricTableSum(
        val sourceDescriptor: SourceDescriptor,
        val metrics: OverviewMetricMap
) : Iterable<Map.Entry<OverviewMetricType, Int>> {
    override fun iterator() = metrics.iterator()

    operator fun get(metricKey: OverviewMetricType): Int = metrics[metricKey]
}
