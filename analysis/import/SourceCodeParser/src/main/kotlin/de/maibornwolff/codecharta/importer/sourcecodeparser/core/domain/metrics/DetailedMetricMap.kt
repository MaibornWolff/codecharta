package de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics

class DetailedMetricMap(private val metrics: Map<DetailedMetricType, Int>) : Iterable<Map.Entry<DetailedMetricType, Int>> {

    constructor(vararg pairs: Pair<DetailedMetricType, Int>) : this(pairs.toMap())

    override fun iterator(): Iterator<Map.Entry<DetailedMetricType, Int>> = metrics.iterator()

    operator fun get(metricKey: DetailedMetricType): Int = metrics.getOrDefault(metricKey, 0)
}