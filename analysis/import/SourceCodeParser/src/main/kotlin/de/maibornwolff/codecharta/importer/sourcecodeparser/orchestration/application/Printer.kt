package de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.application

import de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.domain.metrics.OverviewMetric
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.DetailedMetricTable

interface Printer {

    fun printDetails(detailedMetricTable: DetailedMetricTable)
    fun printOverview(overviewMetric: OverviewMetric)

}