package de.maibornwolff.codecharta.importer.sourcecodeparser.integration.domain.metrics

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.MetricMap
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.MetricStrategy
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.tagged.Line

class DefaultMetricStrategy: MetricStrategy {
    override fun metricsOf(line: Line, previousMetrics: MetricMap): MetricMap {
        TODO("not implemented") //To change body of created functions use File | Settings | File Templates.
    }

}