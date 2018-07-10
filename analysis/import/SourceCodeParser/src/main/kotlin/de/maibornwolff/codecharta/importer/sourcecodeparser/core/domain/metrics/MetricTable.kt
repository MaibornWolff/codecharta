package de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.tagged.TaggableFile
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.FileSummary
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.MetricCollection

class MetricTable(taggableFile: TaggableFile, private val metricStrategy: MetricStrategy): Iterable<Row> {

    // IMPORTANT: line numbers start at 1 - just like our interface, but this array starts at 0
    private val rows = toRows(taggableFile)

    operator fun get(lineNumber: Int): Row {
        return rows[lineNumber - 1]
    }

    override fun iterator(): Iterator<Row> = rows.iterator()

    fun rowCount(): Int {
        return rows.size
    }

    fun summary() = FileSummary(
            "test",
            "",
            rows.last().metrics
    )

    private fun toRows(taggableFile: TaggableFile): Array<Row> {
        var previousMetrics = MetricCollection()
        return taggableFile.map {
            val newMetrics = metricStrategy.metricsOf(it, previousMetrics)
            val row = Row(it, newMetrics)
            previousMetrics = newMetrics
            row
        }.toTypedArray()
    }
}
