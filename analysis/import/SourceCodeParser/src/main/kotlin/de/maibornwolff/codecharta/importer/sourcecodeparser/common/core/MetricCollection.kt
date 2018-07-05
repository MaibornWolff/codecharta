package de.maibornwolff.codecharta.importer.sourcecodeparser.common.core

class MetricCollection(private vararg val pairs: Pair<Metric, Int>) {

    private val metrics = hashMapOf(*pairs)

    operator fun get(metricKey: Metric): Int = metrics.getOrDefault(metricKey, 0)
}