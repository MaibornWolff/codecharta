package de.maibornwolff.codecharta.importer.sourcecodeparser.integration.application

import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.metrics.MetricTable

interface Printer {

    fun printFile(rowMetrics: MetricTable)
    fun printFolder(metrics: List<MetricTable>)

}