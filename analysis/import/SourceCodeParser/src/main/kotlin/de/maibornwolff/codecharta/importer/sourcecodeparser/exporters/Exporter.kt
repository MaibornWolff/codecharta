package de.maibornwolff.codecharta.importer.sourcecodeparser.exporters

import de.maibornwolff.codecharta.importer.sourcecodeparser.metrics.FileMetrics

interface Exporter {
    fun generate(metricsMap: MutableMap<String, FileMetrics>, allMetrics: Set<String>) : String
}