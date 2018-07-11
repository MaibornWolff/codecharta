package de.maibornwolff.codecharta.importer.sourcecodeparser.integration.application

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.MultiMetric
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.SingleMetricTable

interface Printer {

    fun printFile(rowMetrics: SingleMetricTable)
    fun printFolder(folderMetrics: MultiMetric)

}