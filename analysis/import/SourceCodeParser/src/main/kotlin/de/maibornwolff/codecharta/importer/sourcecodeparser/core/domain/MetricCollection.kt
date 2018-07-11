package de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain

class MetricCollection(private val metrics: Map<MetricType, Int>): Iterable<Map.Entry<MetricType, Int>> {

    override fun iterator(): Iterator<Map.Entry<MetricType, Int>> = metrics.iterator()

    constructor(vararg pairs: Pair<MetricType, Int>): this(pairs.toMap())

    operator fun get(metricKey: MetricType): Int = metrics.getOrDefault(metricKey, 0)
}