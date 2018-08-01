package de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.tagging.Line

class DetailedMetricTableRow(line: Line, internal val metrics: DetailedMetricMap) {

    val rowNumber = line.lineNumber
    val text = line.text
    val tags = line.tags

    operator fun get(metricKey: DetailedMetricType) = metrics[metricKey]

    fun metricWasIncremented(metricType: DetailedMetricType, otherTableRow: DetailedMetricTableRow) = compareToMetric(metricType, otherTableRow) > 0
    private fun compareToMetric(metricType: DetailedMetricType, otherTableRow: DetailedMetricTableRow) = metrics[metricType] - otherTableRow[metricType]

    override fun toString(): String {
        return "DetailedMetricTableRow(${metrics[DetailedMetricType.LoC]}: $text | tags=$tags)"
    }

    companion object {
        val NULL = DetailedMetricTableRow(Line.NULL, DetailedMetricMap())
    }

}