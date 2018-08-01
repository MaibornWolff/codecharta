package de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.tagging.Line

interface MetricCalculationStrategy {
    fun calculateMetrics(line: Line, previousMetrics: DetailedMetricMap): DetailedMetricMap
}