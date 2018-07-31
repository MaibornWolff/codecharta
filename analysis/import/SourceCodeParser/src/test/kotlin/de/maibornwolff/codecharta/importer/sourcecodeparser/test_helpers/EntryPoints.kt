package de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.DetailedMetricTable
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.infrastructure.antlr.java.AntlrJavaCodeTagProvider
import de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.application.DetailedSourceProvider
import de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.application.MetricCalculator
import de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.application.OverviewSourceProvider
import de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.domain.metrics.OverviewMetric

fun calculateDetailedMetrics(detailedSourceProvider: DetailedSourceProvider): DetailedMetricTable {
    return MetricCalculator(AntlrJavaCodeTagProvider()).calculateDetailedMetrics(detailedSourceProvider)
}

fun calculateOverviewMetrics(overviewSourceProvider: OverviewSourceProvider): OverviewMetric {
    return MetricCalculator(AntlrJavaCodeTagProvider()).calculateOverviewMetrics(overviewSourceProvider)
}