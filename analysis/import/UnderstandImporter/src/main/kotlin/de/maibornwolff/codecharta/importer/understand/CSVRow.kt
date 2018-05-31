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

import de.maibornwolff.codecharta.model.*
import java.util.*
import java.util.regex.Pattern

class CSVRow(private val row: Array<String?>, private val header: CSVHeader, private val pathSeparator: Char) {

    init {
        if (row.size <= header.pathColumn) {
            throw IllegalArgumentException(
                    "Row " + Arrays.toString(row) + " has no column containing the file path. Should be in " + header.pathColumn + "th column.")
        }
    }

    fun pathInTree(): Path {
        return PathFactory.fromFileSystemPath(
                path.substring(0, path.lastIndexOf(pathSeparator) + 1),
                pathSeparator
        )
    }

    fun asNode(): Node {
        val filename = path.substring(path.lastIndexOf(pathSeparator) + 1)
        return Node(filename, NodeType.File, attributes, nodeMergingStrategy = NodeMaxAttributeMerger)
    }

    private val path =
            if (row[header.pathColumn] == null) throw IllegalArgumentException("Ignoring empty paths.")
            else row[header.pathColumn]!!

    private val floatPattern = Pattern.compile("\\d+[,.]?\\d*")

    private fun validAttributeOfRow(i: Int) =
            i < row.size && row[i] != null && floatPattern.matcher(row[i]).matches()

    private fun parseAttributeOfRow(i: Int) =
            java.lang.Float.parseFloat(row[i]!!.replace(',', '.'))

    private val attributes =
            header.columnNumbers
                    .filter { validAttributeOfRow(it) }
                    .associateBy(
                            { header.getColumnName(it) },
                            { parseAttributeOfRow(it) }
                    )

}
