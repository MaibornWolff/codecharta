package de.maibornwolff.codecharta.importer.csv

import java.util.*

class CSVHeader(header: Array<String?>) {
    private val headerMap: MutableMap<Int, String>

    val columnNumbers: Set<Int>
        get() = headerMap.keys

    val pathColumn: Int
        get() = headerMap.keys.firstOrNull { i -> headerMap[i].equals("path", ignoreCase = true) }
                ?: headerMap.keys.first()

    init {
        headerMap = HashMap()
        for (i in header.indices) {
            when {
                header[i] == null || header[i]!!.isEmpty() -> System.err.println("Ignoring column number $i (counting from 0) as it has no column name.")
                headerMap.containsValue(header[i]) -> System.err.println("Ignoring column number " + i + " (counting from 0) with column name " + header[i] + " as it duplicates a previous column.")
                else -> headerMap[i] = header[i]!!
            }
        }

        if (headerMap.isEmpty()) {
            throw IllegalArgumentException("Header is empty.")
        }
    }

    fun getColumnName(i: Int): String {
        return headerMap[i] ?: throw IllegalArgumentException("No " + i + "th column present.")
    }
}
