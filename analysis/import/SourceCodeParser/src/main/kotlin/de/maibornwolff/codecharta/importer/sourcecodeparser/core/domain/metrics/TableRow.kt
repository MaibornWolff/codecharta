package de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.tagged.Line

class TableRow(line: Line, internal val metrics: MetricMap) {

    val text = line.text
    val tags = line.tags()

    operator fun get(metricKey: MetricType) = metrics[metricKey]

    fun metricWasIncremented(metricType: MetricType, otherTableRow: TableRow) = compareToMetric(metricType, otherTableRow) > 0
    private fun compareToMetric(metricType: MetricType, otherTableRow: TableRow) = metrics[metricType] - otherTableRow[metricType]

    override fun toString(): String {
        return "TableRow(${metrics[MetricType.LoC]}: $text | tags=$tags)"
    }

    companion object {
        val NULL = TableRow(Line.NULL, MetricMap())
    }

}