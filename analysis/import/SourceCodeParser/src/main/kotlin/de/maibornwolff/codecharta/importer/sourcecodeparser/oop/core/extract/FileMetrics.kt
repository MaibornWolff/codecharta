package de.maibornwolff.codecharta.importer.sourcecodeparser.oop.core.extract

import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.core.intermediate.SourceCode

class FileMetrics(sourceCode: SourceCode): Iterable<Row> {

    // IMPORTANT: line numbers start at 1, but this array starts at 0
    private val rows = toRows(sourceCode)

    operator fun get(lineNumber: Int): Row {
        return rows[lineNumber - 1]
    }

    override fun iterator(): Iterator<Row> = rows.iterator()

    private fun toRows(sourceCode: SourceCode): Array<Row> {
        var previousRow = Row.NULL
        return sourceCode.map {
            val row = Row(it, previousRow)
            previousRow = row
            row
        }.toTypedArray()
    }

    fun rowCount(): Int {
        return rows.size
    }

    fun loc() = get(rowCount()).loc
    fun rloc() = get(rowCount()).rloc
}
