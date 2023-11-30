package de.maibornwolff.codecharta.parser.rawtextparser

class FileMetrics {
    val metricsMap = mutableMapOf<String, Double>()

    fun addMetric(name: String, value: Number): FileMetrics {
        metricsMap[name] = value.toDouble()
        return this
    }
}
