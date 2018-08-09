package de.maibornwolff.codecharta.importer.codemaat

import de.maibornwolff.codecharta.model.*
import java.util.*

class CSVRow(private val row: Array<String?>, private val header: CSVHeader, private val pathSeparator: Char) {

    init {
        if (row.size <= header.pathColumn) {
            throw IllegalArgumentException(
                    "Row " + Arrays.toString(row) + " has no column containing the file path. Should be in " + header.pathColumn + "th column.")
        }
    }

    fun getFileNameFromPath(path: String): String {
        return path.substring(path.lastIndexOf(pathSeparator) + 1)
    }

    fun asDependency(): Dependency {
        val rootNode = "/root/"
        val entityPath = rootNode + Path(attributes.get("entity")!!).edgesList.first()
        val coupledPath = rootNode + Path(attributes.get("coupled")!!).edgesList.first()

        return Dependency(
                entityPath,
                getFileNameFromPath(entityPath),
                coupledPath,
                getFileNameFromPath(coupledPath),
                attributes.get("degree")!!.toInt(),
                attributes.get("average-revs")!!.toInt()
        )
    }

    private fun validAttributeOfRow(i: Int) =
            i < row.size && row[i] != null

    private val attributes =
            header.columnNumbers
                    .filter { validAttributeOfRow(it) }
                    .associateBy(
                            { header.getColumnName(it) },
                            { row[it]!! }
                    )
}