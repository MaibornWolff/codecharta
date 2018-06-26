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

class UnderstandCSVRow(private val rawRow: Array<String?>, private val header: UnderstandCSVHeader, private val pathSeparator: Char) {

    init {
        if (rawRow.size <= maxOf(header.fileColumn, header.nameColumn, header.nameColumn)) {
            throw IllegalArgumentException(
                    "Row " + Arrays.toString(rawRow) + " does not contain the necessary hierarchical information.")
        }
    }

    private val file =
            if (rawRow[header.fileColumn] == null) throw IllegalArgumentException("Ignoring empty paths.")
            else rawRow[header.fileColumn]!!

    private val name = rawRow[header.nameColumn] ?: ""

    private val kind =
            if (rawRow[header.kindColumn] == null) throw IllegalArgumentException("Ignoring rows without kind information.")
            else rawRow[header.kindColumn]!!

    private val filename = file.substring(file.lastIndexOf(pathSeparator) + 1)

    private val directoryContainingFile = file.substring(0, file.lastIndexOf(pathSeparator) + 1)

    private val floatPattern = Pattern.compile("\\d+[,.]?\\d*")

    private fun validAttributeOfRow(i: Int) =
            i < rawRow.size && rawRow[i] != null && floatPattern.matcher(rawRow[i]).matches()

    private fun parseAttributeOfRow(i: Int) =
            java.lang.Float.parseFloat(rawRow[i]!!.replace(',', '.'))

    private val attributes =
            header.columnNumbers
                    .filter { validAttributeOfRow(it) }
                    .associateBy(
                            { header.getColumnName(it) },
                            { parseAttributeOfRow(it) }
                    )

    val isFileRow = kind.equals("file", true)

    private val nodeType =
            mapOf(
                    Pair("File", NodeType.File),
                    Pair("Package", NodeType.Package),
                    Pair("Class", NodeType.Class),
                    Pair("Interface", NodeType.Interface),
                    Pair("Method", NodeType.Method),
                    Pair("Function", NodeType.Method)
            )[kind] ?: NodeType.Unknown


    fun pathInTree(): Path {
        return when {
            isFileRow -> PathFactory.fromFileSystemPath(directoryContainingFile, pathSeparator)
            else -> PathFactory.fromFileSystemPath(file, pathSeparator)
        }
    }

    fun asNode(): MutableNode {
        return when {
            isFileRow -> MutableNode(filename, nodeType, attributes)
            else -> MutableNode(name, nodeType, attributes)
        }
    }


}
