package de.maibornwolff.codecharta.importer.csv

import mu.KotlinLogging
import java.util.*

class CSVHeader(private val header: Array<String?>, private val pathColumnName: String = "path") {
    private val logger = KotlinLogging.logger {}
    private val headerMap: MutableMap<Int, String>
    val columnNumbers: Set<Int>
        get() = headerMap.keys
    val pathColumn: Int
        get() = headerMap.keys.firstOrNull { i -> headerMap[i].equals(pathColumnName, ignoreCase = true) }
            ?: headerMap.keys.first()

    init {
        headerMap = HashMap()
        for (i in header.indices) {
            when {
                header[i].isNullOrEmpty() ->
                    logger.warn { "Ignoring ${i + 1}-th column number due to: Column has no name." }
                headerMap.containsValue(header[i]) ->
                    logger.warn { "Ignoring ${i + 1}-th column number due to: Column name '${header[i]}' duplicates a previous column." }
                else ->
                    headerMap[i] = header[i]!!
            }
        }

        if (headerMap.isEmpty()) {
            throw IllegalArgumentException("Header is empty.")
        }
    }

    fun getColumnName(i: Int): String {
        return headerMap[i] ?: throw IllegalArgumentException("No ${i + 1}-th column present.")
    }
}
