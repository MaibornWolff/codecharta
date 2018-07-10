package de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain

class MetricCollection(private vararg val pairs: Pair<MetricType, Int>) {

    private val metrics = hashMapOf(*pairs)

    operator fun get(metricKey: MetricType): Int = metrics.getOrDefault(metricKey, 0)
}