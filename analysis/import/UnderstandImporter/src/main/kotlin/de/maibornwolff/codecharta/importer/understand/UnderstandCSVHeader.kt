/*
 * Copyright (c) 2018, MaibornWolff GmbH
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *  * Redistributions of source code must retain the above copyright notice,
 *    this list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *  * Neither the name of  nor the names of its contributors may be used to
 *    endorse or promote products derived from this software without specific
 *    prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

package de.maibornwolff.codecharta.importer.understand

import mu.KotlinLogging
import java.util.*

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
                header[i] == null || header[i]!!.isEmpty() -> logger.warn { "Ignoring column number $i (counting from 0) as it has no column name." }
                headerMap.containsValue(header[i]) -> logger.warn { "Ignoring column number $i (counting from 0) with column name ${header[i]} as it duplicates a previous column." }
                else -> headerMap[i] = header[i]!!
            }
        }

        if (headerMap.isEmpty()) {
            throw IllegalArgumentException("Header is empty.")
        }

        if (!headerMap.values.containsAll(setOf("File", "Name", "Kind"))) {
            throw IllegalArgumentException("csv needs File, Name and Kind in header.")
        }
    }

    fun getColumnName(i: Int): String {
        return headerMap[i] ?: throw IllegalArgumentException("No " + i + "th column present.")
    }
}
