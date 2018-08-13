package de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.application

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.DetailedMetricTable
import de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.domain.metrics.OverviewMetric

interface MetricWriter {

    fun printDetails(detailedMetricTable: DetailedMetricTable)
    fun printOverview(overviewMetric: OverviewMetric)

}