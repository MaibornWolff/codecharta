package de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.metrics

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.*
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.tagging.Line
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.tagging.BranchTags
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.tagging.CodeTags
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.tagging.MethodTags

class OopMetricCalculationStrategy : MetricCalculationStrategy {

    override fun calculateMetrics(line: Line, previousMetrics: DetailedMetricMap): DetailedMetricMap {
        return DetailedMetricMap(DetailedMetricType.values().map { it to singleMetric(it, line, previousMetrics) }.toMap())
    }

    private fun singleMetric(metricType: DetailedMetricType, line: Line, previousMetrics: DetailedMetricMap): Int {
        return when (metricType) {
            DetailedMetricType.LoC -> line.lineNumber
            DetailedMetricType.RLoc -> (if (hasCodeTags(line)) 1 else 0) + previousMetrics[DetailedMetricType.RLoc]
            DetailedMetricType.MCC -> countMethodDeclaration(line) + countBranchTags(line) + previousMetrics[DetailedMetricType.MCC]
        }

    }

    private fun hasCodeTags(line: Line) = line.tags.filterIsInstance<CodeTags>().isNotEmpty()
    private fun countBranchTags(line: Line) = line.tags.filterIsInstance<BranchTags>().count()
    private fun countMethodDeclaration(line: Line) = line.tags.filterIsInstance<MethodTags>().count()
}