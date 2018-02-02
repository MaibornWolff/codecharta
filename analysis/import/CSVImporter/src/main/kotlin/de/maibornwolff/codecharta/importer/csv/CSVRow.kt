package de.maibornwolff.codecharta.importer.csv

import java.util.*
import java.util.regex.Pattern

class CSVRow(private val row: Array<String>, private val header: CSVHeader, private val pathSeparator: Char) {

    private val floatPattern = Pattern.compile("\\d+[,.]?\\d*")

    val path: String
        get() = row[header.pathColumn]

    val fileName: String
        get() {
            val path = path
            return path.substring(path.lastIndexOf(pathSeparator) + 1)
        }

    val folderWithFile: String
        get() {
            val path = path
            return path.substring(0, path.lastIndexOf(pathSeparator) + 1)
        }

    val attributes: Map<String, Any>
        get() {
            return header.columnNumbers
                    .filter { this.validAttributeOfRow(it) }
                    .associateBy(
                            { header.getColumnName(it) },
                            { i -> java.lang.Float.parseFloat(row[i].replace(',', '.')) }
                    )
        }

    init {
        if (row.size <= header.pathColumn) {
            throw IllegalArgumentException(
                    "Row " + Arrays.toString(row) + " has no column containing the file path. Should be in " + header.pathColumn + "th column.")
        }
    }

    private fun validAttributeOfRow(i: Int): Boolean {
        return i < row.size && floatPattern.matcher(row[i]).matches()
    }
}
