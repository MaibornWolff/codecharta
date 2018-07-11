package de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.tagged.TaggableLines

class SingleMetricTable(taggableLines: TaggableLines, private val metricCalculationStrategy: MetricCalculationStrategy): Iterable<SingleMetricTableRow> {

    // IMPORTANT: line numbers start at 1 - just like our interface, but this array starts at 0
    private val rows = toRows(taggableLines)
    val sum = SingleMetricTableSum(
            "test",
            "",
            taggableLines.language,
            rows.last().metrics)
    val language = taggableLines.language

    operator fun get(lineNumber: Int): SingleMetricTableRow {
        return rows[lineNumber - 1]
    }

    override fun iterator(): Iterator<SingleMetricTableRow> = rows.iterator()

    fun rowCount(): Int {
        return rows.size
    }

    private fun toRows(taggableLines: TaggableLines): Array<SingleMetricTableRow> {
        var previousMetrics = MetricMap()
        return taggableLines.map {
            val newMetrics = metricCalculationStrategy.calculateMetrics(it, previousMetrics)
            val row = SingleMetricTableRow(it, newMetrics)
            previousMetrics = newMetrics
            row
        }.toTypedArray()
    }
}
