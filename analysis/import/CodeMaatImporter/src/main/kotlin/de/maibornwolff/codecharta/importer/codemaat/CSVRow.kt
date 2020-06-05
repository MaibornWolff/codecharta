package de.maibornwolff.codecharta.importer.codemaat

import de.maibornwolff.codecharta.model.Edge
import java.util.* // ktlint-disable no-wildcard-imports

class CSVRow(private val row: Array<String?>, private val header: CSVHeader, private val pathSeparator: Char) {

    init {
        if (row.size <= header.pathColumn.size) {
            throw IllegalArgumentException(
                "Row " + Arrays.toString(
                    row
                ) + " has no column containing the file path. Should be in one of " + header.pathColumn + " columns."
            )
        }
    }

    fun asEdge(): Edge {
        val rootNode = "/root/"
        val fromNodeName = rootNode + allColumns.get("entity")
        val toNodeName = rootNode + allColumns.get("coupled")

        return Edge(fromNodeName, toNodeName, attributes)
    }

    private val allColumns: Map<String, String> =
        header.columnNumbers
            .filter { validAttributeValue(it) }
            .associateBy(
                { header.getColumnName(it) },
                { row[it]!! }
            )
    private val attributes: Map<String, Int> =
        header.columnNumbers
            .filter { validAttributeValue(it) && isAttributeColumn(it) }
            .associateBy(
                { header.getColumnName(it) },
                { row[it]!!.toInt() }
            )

    private fun validAttributeValue(i: Int) =
        i < row.size && row[i] != null

    private fun isAttributeColumn(i: Int) =
        header.pathColumn.filter { pathColumnIndex -> i == pathColumnIndex }.isEmpty()
}