package de.maibornwolff.codecharta.parser.rawtextparser.metrics

class FileMetrics {
    val metricMap = mutableMapOf<String, Double>()

    fun addMetric(name: String, value: Number) {
        metricMap[name] = value.toDouble()
    }
}
