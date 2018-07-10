package de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain

class MetricCollection(private val metrics: Map<MetricType, Int>) {
    constructor(vararg pairs: Pair<MetricType, Int>): this(pairs.toMap())

    operator fun get(metricKey: MetricType): Int = metrics.getOrDefault(metricKey, 0)
}