package de.maibornwolff.codecharta.analysers.parsers.rawtext.metrics

class FileMetrics {
    val metricsMap = mutableMapOf<String, Double>()
    var checksum: String? = null

    fun addMetric(name: String, value: Number): FileMetrics {
        metricsMap[name] = value.toDouble()
        return this
    }

    fun isEmpty(): Boolean = metricsMap.isEmpty()
}
