package de.maibornwolff.codecharta.parser.rawtextparser.model

class FileMetrics {
    val metricMap = mutableMapOf<String, Double>()

    fun addMetric(name: String, value: Number): FileMetrics {
        metricMap[name] = value.toDouble()
        return this
    }
}
