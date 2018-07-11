package de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.tagged.TaggableFile

class MetricTable(taggableFile: TaggableFile, private val metricStrategy: MetricStrategy): Iterable<TableRow>, MetricSummary {

    // IMPORTANT: line numbers start at 1 - just like our interface, but this array starts at 0
    private val rows = toRows(taggableFile)
    private val summary = FileSummary(
            "test",
            "",
            taggableFile.language,
            rows.last().metrics)
    val language = taggableFile.language

    operator fun get(lineNumber: Int): TableRow {
        return rows[lineNumber - 1]
    }

    override fun iterator(): Iterator<TableRow> = rows.iterator()

    fun rowCount(): Int {
        return rows.size
    }

    fun summary() = summary

    private fun toRows(taggableFile: TaggableFile): Array<TableRow> {
        var previousMetrics = MetricMap()
        return taggableFile.map {
            val newMetrics = metricStrategy.metricsOf(it, previousMetrics)
            val row = TableRow(it, newMetrics)
            previousMetrics = newMetrics
            row
        }.toTypedArray()
    }
}
