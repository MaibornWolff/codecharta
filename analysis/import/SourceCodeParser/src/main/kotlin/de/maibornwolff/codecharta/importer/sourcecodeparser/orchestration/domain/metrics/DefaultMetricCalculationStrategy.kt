package de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.domain.metrics

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.MetricCalculationStrategy
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.MetricMap
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.tagged.Line

class DefaultMetricCalculationStrategy: MetricCalculationStrategy {
    override fun calculateMetrics(line: Line, previousMetrics: MetricMap): MetricMap {
        TODO("not implemented") //To change body of created functions use File | Settings | File Templates.
    }

}