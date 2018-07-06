package de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.metrics

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.Metric
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.MetricCollection
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.tagging.CodeTags
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.tagging.Line

class Row(line: Line, previousMetrics: MetricCollection) {


    val rlocWasIncremented = hasCodeTags(line)
    val text = line.text
    val tags = line.tags()
    val metrics = MetricCollection(
            Metric.LoC to line.lineNumber,
            Metric.RLoc to (if (hasCodeTags(line)) 1 else 0) + previousMetrics[Metric.RLoc]
    )
    val rloc = metrics[Metric.RLoc]

    private fun hasCodeTags(line: Line) = line.tags().filterIsInstance<CodeTags>().isNotEmpty()

    operator fun get(metricKey: Metric) = metrics[metricKey]

    override fun toString(): String {
        return "Row(${metrics[Metric.LoC]}: $text | tags=$tags)"
    }

    companion object{
        val NULL = Row(Line.NULL, MetricCollection())
    }

}