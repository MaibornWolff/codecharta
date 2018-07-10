package de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.metrics

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.MetricType
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.MetricCollection
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.tagging.CodeTags
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.Line

class Row(line: Line, previousMetrics: MetricCollection) {


    val rlocWasIncremented = hasCodeTags(line)
    val text = line.text
    val tags = line.tags()
    val metrics = MetricCollection(
            MetricType.LoC to line.lineNumber,
            MetricType.RLoc to (if (hasCodeTags(line)) 1 else 0) + previousMetrics[MetricType.RLoc]
    )
    val rloc = metrics[MetricType.RLoc]

    private fun hasCodeTags(line: Line) = line.tags().filterIsInstance<CodeTags>().isNotEmpty()

    operator fun get(metricKey: MetricType) = metrics[metricKey]

    override fun toString(): String {
        return "Row(${metrics[MetricType.LoC]}: $text | tags=$tags)"
    }

    companion object{
        val NULL = Row(Line.NULL, MetricCollection())
    }

}