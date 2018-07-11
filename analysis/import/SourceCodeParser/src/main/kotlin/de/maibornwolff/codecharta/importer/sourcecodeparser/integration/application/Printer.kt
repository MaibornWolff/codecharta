package de.maibornwolff.codecharta.importer.sourcecodeparser.integration.application

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.OverviewMetric
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.DetailedMetricTable

interface Printer {

    fun printFile(rowMetrics: DetailedMetricTable)
    fun printFolder(folderMetrics: OverviewMetric)

}