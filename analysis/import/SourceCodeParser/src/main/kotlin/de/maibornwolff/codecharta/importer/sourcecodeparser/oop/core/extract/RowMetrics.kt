package de.maibornwolff.codecharta.importer.sourcecodeparser.oop.core.extract

import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.core.intermediate.SourceCode
import de.maibornwolff.codecharta.importer.sourcecodeparser.common.core.FileSummary
import de.maibornwolff.codecharta.importer.sourcecodeparser.common.core.Metric

class RowMetrics(sourceCode: SourceCode): Iterable<Row> {

    // IMPORTANT: line numbers start at 1 - just like our interface, but this array starts at 0
    private val rows = toRows(sourceCode)

    operator fun get(lineNumber: Int): Row {
        return rows[lineNumber - 1]
    }

    override fun iterator(): Iterator<Row> = rows.iterator()

    private fun toRows(sourceCode: SourceCode): Array<Row> {
        var previousRow = Row.NULL
        return sourceCode.map {
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
            rows.last()[Metric.LoC],
            rows.last()[Metric.RLoc]
    )

    fun loc() = get(rowCount())[Metric.LoC]
    fun rloc() = get(rowCount())[Metric.RLoc]
}
