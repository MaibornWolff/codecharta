package de.maibornwolff.codecharta.analysers.parsers.rawtext

class FileMetrics {
    val metricsMap = mutableMapOf<String, Double>()

    fun addMetric(name: String, value: Number): FileMetrics {
        metricsMap[name] = value.toDouble()
        return this
    }

    fun isEmpty(): Boolean {
        return metricsMap.isEmpty()
    }
}
