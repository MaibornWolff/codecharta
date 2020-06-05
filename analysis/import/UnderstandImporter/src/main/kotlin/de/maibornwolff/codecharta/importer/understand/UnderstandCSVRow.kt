package de.maibornwolff.codecharta.importer.understand

import de.maibornwolff.codecharta.model.*
import java.util.regex.Pattern

class UnderstandCSVRow(
    private val rawRow: Array<String?>, private val header: UnderstandCSVHeader,
    private val pathSeparator: Char
) {

    init {
        if (rawRow.size <= maxOf(header.fileColumn, header.nameColumn, header.kindColumn)) {
            throw IllegalArgumentException(
                "Row does not contain the necessary hierarchical information."
            )
        }
    }

    private val file =
        if (rawRow[header.fileColumn] == null) throw IllegalArgumentException("Row has no path information.")
        else rawRow[header.fileColumn]!!
    private val name = rawRow[header.nameColumn] ?: ""
    private val kind =
        if (rawRow[header.kindColumn] == null) throw IllegalArgumentException("Row has no kind information.")
        else rawRow[header.kindColumn]!!
    private val filename = file.substring(file.lastIndexOf(pathSeparator) + 1)
    private val directoryContainingFile = file.substring(0, file.lastIndexOf(pathSeparator) + 1)
    private val floatPattern = Pattern.compile("\\d+[,.]?\\d*")
    private val intPattern = Pattern.compile("\\d+")
    private fun validAttributeOfRow(i: Int) =
        i < rawRow.size && rawRow[i] != null && floatPattern.matcher(rawRow[i]).matches()

    private fun parseAttributeOfRow(i: Int) =
        if (intPattern.matcher(rawRow[i]).matches()) {
            rawRow[i]!!.toLong()
        } else {
            rawRow[i]!!.replace(',', '.').toDouble()
        }

    private val attributes =
        header.columnNumbers
            .filter { validAttributeOfRow(it) }
            .associateBy(
                { header.getColumnName(it) },
                { parseAttributeOfRow(it) }
            )
    private val isFileRow = kind.equals("File", true)
    private val nodeType =
        when {
            kind.endsWith("file", ignoreCase = true) -> NodeType.File
            kind.endsWith("class", ignoreCase = true) -> NodeType.Class
            kind.endsWith("interface", ignoreCase = true) -> NodeType.Class
            kind.endsWith("enum type", ignoreCase = true) -> NodeType.Class
            else -> NodeType.Unknown
        }

    fun pathInTree(): Path {
        return when {
            isFileRow -> PathFactory.fromFileSystemPath(directoryContainingFile, pathSeparator)
            else -> PathFactory.fromFileSystemPath(file, pathSeparator)
        }
    }

    fun asNode(): MutableNode {
        return when {
            isFileRow -> MutableNode(filename, nodeType, attributes)
            nodeType == NodeType.Unknown -> throw IllegalArgumentException("Kind $kind not supported, yet.")
            else -> MutableNode(
                name, nodeType, attributes,
                nodeMergingStrategy = NodeMaxAttributeMerger(true)
            )
        }
    }
}
