package de.maibornwolff.codecharta.importer.sourcecodeparser.integration.application

import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.metrics.RowMetrics

interface Printer {

    fun printFile(rowMetrics: RowMetrics)
    fun printFolder(metrics: List<RowMetrics>)

}