package de.maibornwolff.codecharta.importer.understand

import mu.KotlinLogging
import java.util.* // ktlint-disable no-wildcard-imports

class UnderstandCSVHeader(header: Array<String?>) {
    private val logger = KotlinLogging.logger {}
    private val headerMap: MutableMap<Int, String>
    val columnNumbers: Set<Int>
        get() = headerMap.keys
    val fileColumn: Int
        get() = headerMap.keys.first { i -> headerMap[i].equals("File") }
    val nameColumn: Int
        get() = headerMap.keys.first { i -> headerMap[i].equals("Name") }
    val kindColumn: Int
        get() = headerMap.keys.first { i -> headerMap[i].equals("Kind") }

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

        if (!headerMap.values.containsAll(setOf("File", "Name", "Kind"))) {
            throw IllegalArgumentException("CSV has no File, Name or Kind in header.")
        }
    }

    fun getColumnName(i: Int): String {
        return headerMap[i] ?: throw IllegalArgumentException("No ${i + 1}-th column present.")
    }
}
