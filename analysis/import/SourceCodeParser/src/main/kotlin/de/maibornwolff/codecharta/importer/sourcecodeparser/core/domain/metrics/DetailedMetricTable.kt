package de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.tagging.TaggedSourceCode
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.tagging.Tags

class DetailedMetricTable(
        taggedSourceCode: TaggedSourceCode,
        private val metricCalculationStrategy: MetricCalculationStrategy,
        overviewMetricCalculationStrategy: OverviewMetricCalculationStrategy
) : Iterable<DetailedMetricTableRow> {

    // IMPORTANT: line numbers start at 1 - just like our interface, but this array starts at 0
    private val rows = toRows(taggedSourceCode)

    val sum = DetailedMetricTableSum(
            taggedSourceCode.sourceDescriptor,
            OopMetricOverviewStrategy().toOverviewMetrics(rows.lastOrNull()?.metrics))

    val language = taggedSourceCode.sourceDescriptor.language

    operator fun get(lineNumber: Int): DetailedMetricTableRow {
        return rows[lineNumber - 1]
    }

    override fun iterator(): Iterator<DetailedMetricTableRow> = rows.iterator()

    fun rowCount(): Int {
        return rows.size
    }

    fun linesWithTag(tag: Tags): Collection<Int> {
        return rows
                .filter { it.tags.contains(tag) }
                .map { it.rowNumber }
    }

    private fun toRows(taggedSourceCode: TaggedSourceCode): Array<DetailedMetricTableRow> {
        var previousMetrics = DetailedMetricMap()
        return taggedSourceCode.map {
            val newMetrics = metricCalculationStrategy.calculateMetrics(it, previousMetrics)
            val row = DetailedMetricTableRow(it, newMetrics)
            previousMetrics = newMetrics
            row
        }.toTypedArray()
    }
}
