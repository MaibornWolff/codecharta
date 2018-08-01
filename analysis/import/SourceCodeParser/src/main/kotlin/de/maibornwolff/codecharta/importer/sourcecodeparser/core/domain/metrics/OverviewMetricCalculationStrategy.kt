package de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics

interface OverviewMetricCalculationStrategy {
    fun toOverviewMetrics(detailedMetricMap: DetailedMetricMap?): OverviewMetricMap
}