package de.maibornwolff.codecharta.importer.indentationlevelparser

class FileMetrics {
    val metricMap = mutableMapOf<String, Double>()

    fun addMetric(name: String, value: Int): FileMetrics {
        metricMap[name] = value.toDouble()
        return this
    }
}