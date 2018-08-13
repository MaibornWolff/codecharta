package de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.domain.metrics

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.DetailedMetricMap
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.MetricCalculationStrategy
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.OverviewMetricMap
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.tagging.Line

class DefaultMetricCalculationStrategy : MetricCalculationStrategy {
    override fun calculateMetrics(line: Line, previousMetrics: DetailedMetricMap): DetailedMetricMap {
        TODO("not implemented") //To change body of created functions use File | Settings | File Templates.
    }

}