package de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.metrics

import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.tagging.SourceFile
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.FileSummary
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.Metric

class RowMetrics(sourceFile: SourceFile): Iterable<Row> {

    // IMPORTANT: line numbers start at 1 - just like our interface, but this array starts at 0
    private val rows = toRows(sourceFile)

    operator fun get(lineNumber: Int): Row {
        return rows[lineNumber - 1]
    }

    override fun iterator(): Iterator<Row> = rows.iterator()

    private fun toRows(sourceFile: SourceFile): Array<Row> {
        var previousRow = Row.NULL
        return sourceFile.map {
            val row = Row(it, previousRow.metrics)
            previousRow = row
            row
        }.toTypedArray()
    }

    fun rowCount(): Int {
        return rows.size
    }

    fun summary() = FileSummary(
            "test",
            "",
            rows.last().metrics
    )

    fun loc() = get(rowCount())[Metric.LoC]
    fun rloc() = get(rowCount())[Metric.RLoc]
}
