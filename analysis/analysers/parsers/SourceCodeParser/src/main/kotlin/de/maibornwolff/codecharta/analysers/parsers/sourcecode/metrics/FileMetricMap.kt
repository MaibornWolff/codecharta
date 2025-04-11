package de.maibornwolff.codecharta.analysers.parsers.sourcecode.metrics

class FileMetricMap {
    val fileMetrics = mutableMapOf<String, Number>()

    fun add(metric: String, value: Number): FileMetricMap {
        fileMetrics[metric] = value
        return this
    }

    fun getMetricValue(metric: String): Number? {
        return fileMetrics[metric]
    }
}
