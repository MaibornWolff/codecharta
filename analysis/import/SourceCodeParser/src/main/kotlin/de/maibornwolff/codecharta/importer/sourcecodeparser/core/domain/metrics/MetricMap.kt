package de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics

class MetricMap(private val metrics: Map<MetricType, Int>): Iterable<Map.Entry<MetricType, Int>> {

    constructor(vararg pairs: Pair<MetricType, Int>): this(pairs.toMap())

    override fun iterator(): Iterator<Map.Entry<MetricType, Int>> = metrics.iterator()

    operator fun get(metricKey: MetricType): Int = metrics.getOrDefault(metricKey, 0)
}