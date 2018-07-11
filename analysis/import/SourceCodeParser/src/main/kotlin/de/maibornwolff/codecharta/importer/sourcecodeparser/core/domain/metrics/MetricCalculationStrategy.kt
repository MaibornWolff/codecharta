package de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.tagged.Line

interface MetricCalculationStrategy {
    fun calculateMetrics(line: Line, previousMetrics: MetricMap): MetricMap
}