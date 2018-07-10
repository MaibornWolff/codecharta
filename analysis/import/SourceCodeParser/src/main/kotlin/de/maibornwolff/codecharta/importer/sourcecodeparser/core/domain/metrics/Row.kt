package de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.MetricType
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.MetricCollection
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.tagging.CodeTags
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.tagged.Line

class Row(line: Line, internal val metrics: MetricCollection) {

    val text = line.text
    val tags = line.tags()

    operator fun get(metricKey: MetricType) = metrics[metricKey]

    fun metricWasIncremented(metricType: MetricType, otherRow: Row) = compareToMetric(metricType, otherRow) > 0
    private fun compareToMetric(metricType: MetricType, otherRow: Row) = metrics[metricType] - otherRow[metricType]

    override fun toString(): String {
        return "Row(${metrics[MetricType.LoC]}: $text | tags=$tags)"
    }

    companion object {
        val NULL = Row(Line.NULL, MetricCollection())
    }

}