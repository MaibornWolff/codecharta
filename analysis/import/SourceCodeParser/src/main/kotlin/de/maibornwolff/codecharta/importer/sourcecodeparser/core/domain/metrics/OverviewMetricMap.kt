package de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics

class OverviewMetricMap(private val metrics: Map<OverviewMetricType, Int>) : Iterable<Map.Entry<OverviewMetricType, Int>> {

    constructor(vararg pairs: Pair<OverviewMetricType, Int>) : this(pairs.toMap())
    constructor(pairs: List<Pair<OverviewMetricType, Int>>) : this(pairs.toMap())

    override fun iterator(): Iterator<Map.Entry<OverviewMetricType, Int>> = metrics.iterator()

    operator fun get(metricKey: OverviewMetricType): Int = metrics.getOrDefault(metricKey, 0)
}