package de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.tagged.TaggableLines
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.tagged.Tags

class DetailedMetricTable(taggableLines: TaggableLines, private val metricCalculationStrategy: MetricCalculationStrategy): Iterable<DetailedMetricTableRow> {

    // IMPORTANT: line numbers start at 1 - just like our interface, but this array starts at 0
    private val rows = toRows(taggableLines)
    val sum = DetailedMetricTableSum(
            taggableLines.sourceDescriptor,
            rows.last().metrics)
    val language = taggableLines.sourceDescriptor.language

    operator fun get(lineNumber: Int): DetailedMetricTableRow {
        return rows[lineNumber - 1]
    }

    override fun iterator(): Iterator<DetailedMetricTableRow> = rows.iterator()

    fun rowCount(): Int {
        return rows.size
    }

    private fun toRows(taggableLines: TaggableLines): Array<DetailedMetricTableRow> {
        var previousMetrics = MetricMap()
        return taggableLines.map {
            val newMetrics = metricCalculationStrategy.calculateMetrics(it, previousMetrics)
            val row = DetailedMetricTableRow(it, newMetrics)
            previousMetrics = newMetrics
            row
        }.toTypedArray()
    }

    fun linesWithTag(tag: Tags): Collection<Int> {
        return rows
                .filter { it.tags.contains(tag) }
                .map { it.rowNumber }
    }
}
