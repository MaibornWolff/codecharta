package de.maibornwolff.codecharta.importer.sourcecodeparser.oop.core.extract

import de.maibornwolff.codecharta.importer.sourcecodeparser.common.core.Metric
import de.maibornwolff.codecharta.importer.sourcecodeparser.common.core.MetricCollection
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.core.antlrinterop.CodeTags
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.core.intermediate.Line

class Row(line: Line, previousMetrics: MetricCollection) {


    val rlocWasIncremented = hasCodeTags(line)
    val text = line.text
    val tags = line.tags()
    val metrics = MetricCollection(
            Metric.LoC to line.lineNumber,
            Metric.RLoc to (if(hasCodeTags(line)) 1 else 0) + previousMetrics[Metric.RLoc]
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