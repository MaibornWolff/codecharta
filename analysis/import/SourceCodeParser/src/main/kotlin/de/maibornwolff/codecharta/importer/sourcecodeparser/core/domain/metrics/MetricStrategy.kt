package de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.MetricCollection
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.tagged.Line

interface MetricStrategy {
    fun metricsOf(line: Line, previousMetrics: MetricCollection): MetricCollection
}