package de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.metrics

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.MetricCalculationStrategy
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.MetricMap
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.MetricType
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.tagging.Line
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.tagging.BranchTags
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.tagging.CodeTags
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.tagging.MethodTags

class OopMetricCalculationStrategy: MetricCalculationStrategy {

    override fun calculateMetrics(line: Line, previousMetrics: MetricMap): MetricMap {
        return MetricMap(MetricType.values().map { it to singleMetric(it, line, previousMetrics) }.toMap())
    }

    private fun singleMetric(metricType: MetricType, line: Line, previousMetrics: MetricMap): Int{
        return when(metricType){
            MetricType.LoC -> line.lineNumber
            MetricType.RLoc -> (if (hasCodeTags(line)) 1 else 0) + previousMetrics[MetricType.RLoc]
            MetricType.MCC -> countMethodDeclaration(line) + countBranchTags(line) + previousMetrics[MetricType.MCC]
        }
    }

    private fun hasCodeTags(line: Line) = line.tags().filterIsInstance<CodeTags>().isNotEmpty()
    private fun countBranchTags(line: Line) = line.tags().filterIsInstance<BranchTags>().count()
    private fun countMethodDeclaration(line: Line) = line.tags().filterIsInstance<MethodTags>().count()
}