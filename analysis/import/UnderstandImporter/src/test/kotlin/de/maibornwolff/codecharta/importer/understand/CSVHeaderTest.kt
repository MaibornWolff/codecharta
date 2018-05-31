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

import org.hamcrest.CoreMatchers.*
import org.hamcrest.MatcherAssert.assertThat
import org.jetbrains.spek.api.Spek
import org.jetbrains.spek.api.dsl.describe
import org.jetbrains.spek.api.dsl.it
import kotlin.test.assertFailsWith

class CSVHeaderTest : Spek({
    describe("an empty header") {
        it("should throw exception") {
            assertFailsWith(IllegalArgumentException::class) {
                CSVHeader(arrayOf())
            }
        }

    }

    describe("a valid header") {
        val headerLine = arrayOf("first", "second", "", null)
        val header = CSVHeader(headerLine)

        it("should have non-empty columns") {
            assertThat(header.columnNumbers, hasItems(0, 1))
            assertThat(header.getColumnName(0), `is`(headerLine[0]))
            assertThat(header.getColumnName(1), `is`(headerLine[1]))
        }

        it("should ignore empty columns") {
            assertThat(header.columnNumbers, not(hasItem(2)))
        }


        it("should ignore null columns") {
            assertThat(header.columnNumbers, not(hasItem(3)))
        }

        it("getColumnName should throw exception if column name not present") {
            assertFailsWith(IllegalArgumentException::class) {
                header.getColumnName(4)
            }
        }

        it("getPathColumn should return first column if no path column present and first column non empty") {
            assertThat(header.pathColumn, `is`(0))
        }
    }

    describe("a duplicate header") {
        val headerLine = arrayOf<String?>("first", "first")
        val header = CSVHeader(headerLine)

        it("should be ignored") {
            assertThat(header.columnNumbers, hasItems(0))
            assertThat(header.getColumnName(0), `is`(headerLine[0]))
        }
    }

    describe("a header with column with name path") {
        val header = CSVHeader(arrayOf("first", "path", "third"))

        it("should have this column as path column") {
            assertThat(header.pathColumn, `is`(1))
        }
    }


    describe("a header without path column and empty first column") {
        val header = CSVHeader(arrayOf("", null, "second", "third"))

        it("should have first non-empty column as path column") {
            assertThat(header.pathColumn, `is`(2))
        }
    }
})