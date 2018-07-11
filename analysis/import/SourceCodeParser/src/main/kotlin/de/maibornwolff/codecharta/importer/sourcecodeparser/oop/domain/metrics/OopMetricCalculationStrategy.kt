package de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.metrics

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.MetricCalculationStrategy
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.MetricMap
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.MetricType
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.tagged.Line
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.tagging.CodeTags

class OopMetricCalculationStrategy: MetricCalculationStrategy {

    override fun calculateMetrics(line: Line, previousMetrics: MetricMap): MetricMap {
        return MetricMap(MetricType.values().map { it to singleMetric(it, line, previousMetrics) }.toMap())
    }

    private fun singleMetric(metricType: MetricType, line: Line, previousMetrics: MetricMap): Int{
        return when(metricType){
            MetricType.LoC -> line.lineNumber
            MetricType.RLoc -> (if (hasCodeTags(line)) 1 else 0) + previousMetrics[MetricType.RLoc]
        }
    }

    private fun hasCodeTags(line: Line) = line.tags().filterIsInstance<CodeTags>().isNotEmpty()
}