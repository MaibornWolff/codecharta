package de.maibornwolff.codecharta.importer.csv

import de.maibornwolff.codecharta.model.MutableNode
import de.maibornwolff.codecharta.model.NodeType
import de.maibornwolff.codecharta.model.Path
import de.maibornwolff.codecharta.model.PathFactory
import java.util.regex.Pattern

class CSVRow(private val row: Array<String?>, private val header: CSVHeader, private val pathSeparator: Char) {

    init {
        if (row.size <= header.pathColumn) {
            throw IllegalArgumentException(
                "Row  has no column containing the file path. Should be in ${header.pathColumn} th column."
            )
        }
    }

    fun pathInTree(): Path {
        return PathFactory.fromFileSystemPath(
            path.substring(0, path.lastIndexOf(pathSeparator) + 1),
            pathSeparator
        )
    }

    fun asNode(): MutableNode {
        val filename = path.substring(path.lastIndexOf(pathSeparator) + 1)
        return MutableNode(filename, NodeType.File, attributes)
    }

    private val path =
        if (row[header.pathColumn] == null) throw IllegalArgumentException("Row has no path information.")
        else row[header.pathColumn]!!
    private val floatPattern = Pattern.compile("\\d+[,.]?\\d*")
    private fun validAttributeOfRow(i: Int) =
        i < row.size && row[i] != null && floatPattern.matcher(row[i]).matches()

    private fun parseAttributeOfRow(i: Int) =
        java.lang.Double.parseDouble(row[i]!!.replace(',', '.'))

    private val attributes =
        header.columnNumbers
            .filter { validAttributeOfRow(it) }
            .associateBy(
                { header.getColumnName(it) },
                { parseAttributeOfRow(it) }
            )
}
