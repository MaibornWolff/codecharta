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
        val headerLine = arrayOf<String?>()
        it("should throw exception") {
            assertFailsWith(IllegalArgumentException::class) {
                UnderstandCSVHeader(headerLine)
            }
        }
    }

    describe("an invalid header") {
        val headerLine = arrayOf("first", "second", "", null, "Kind", "Name")

        it("should throw exception") {
            assertFailsWith(IllegalArgumentException::class) {
                UnderstandCSVHeader(headerLine)
            }
        }
    }

    describe("a valid header") {
        val headerLine = arrayOf("first", "second", "", null, "Kind", "Name", "File")
        val header = UnderstandCSVHeader(headerLine)

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
                header.getColumnName(7)
            }
        }

        it("should have File column as file column") {
            assertThat(header.fileColumn, `is`(6))
        }

        it("should have Name column as name column") {
            assertThat(header.nameColumn, `is`(5))
        }

        it("should have Kind column as kind column") {
            assertThat(header.kindColumn, `is`(4))
        }
    }

    describe("a duplicate header") {
        val headerLine = arrayOf<String?>("first", "first", "Kind", "Name", "File")
        val header = UnderstandCSVHeader(headerLine)

        it("should be ignored") {
            assertThat(header.columnNumbers, hasItems(0))
            assertThat(header.getColumnName(0), `is`(headerLine[0]))
        }
    }
})