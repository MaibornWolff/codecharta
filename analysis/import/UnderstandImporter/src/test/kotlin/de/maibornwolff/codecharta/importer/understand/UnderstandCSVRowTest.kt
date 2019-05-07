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

import de.maibornwolff.codecharta.model.Path
import org.hamcrest.CoreMatchers.*
import org.hamcrest.MatcherAssert.assertThat
import org.hamcrest.Matchers.hasSize
import org.spekframework.spek2.Spek
import org.spekframework.spek2.style.specification.describe
import kotlin.test.assertFailsWith

class UnderstandCSVRowTest: Spek({
    val pathSeparator = '\\'

    describe("Using a valid header with path column") {
        val header =
                UnderstandCSVHeader(arrayOf("head1", "head2", "head3", "File", "Name", "Kind", "attrib", "attrib2", ""))

        context("considering row of kind file") {
            it("name should be filename from this columnn") {
                val nameExpectedFilenameMap = mapOf(
                        Pair("someNodeName", "someNodeName"),
                        Pair("someDir\\someName", "someName"),
                        Pair("someDir\\anotherDir\\anotherName", "anotherName")
                )

                for (name in nameExpectedFilenameMap.keys) {
                    val rawRow: Array<String?> = arrayOf("projectName", "blubb2", "blubb3", name, "", "File")
                    val node = UnderstandCSVRow(rawRow, header, pathSeparator).asNode()
                    assertThat(node.name, `is`(nameExpectedFilenameMap[name]))
                }
            }

            it("path in Tree should be absolute file name from this column") {
                val nameExpectedFolderWithFileMap = mapOf(
                        Pair("someNodeName", Path.TRIVIAL),
                        Pair("someDir\\someName", Path(listOf("someDir"))),
                        Pair("someDir\\anotherDir\\anotherName", Path(listOf("someDir", "anotherDir")))
                )

                for (name in nameExpectedFolderWithFileMap.keys) {
                    val path = UnderstandCSVRow(arrayOf("projectName", "blubb2", "blubb3", name, "", "File"), header,
                            pathSeparator).pathInTree()
                    assertThat(path, `is`<Path>(nameExpectedFolderWithFileMap[name]))
                }
            }
        }

        context("considering row of kind class") {
            val name = "class name"
            val rawRow: Array<String?> =
                    arrayOf("projectName", "blubb2", "blubb3", "someDir\\anotherDir\\anotherName", name, "Class")
            val understandCSVRow = UnderstandCSVRow(rawRow, header, pathSeparator)

            it("name of class node should match name column") {
                assertThat(understandCSVRow.asNode().name, `is`(name))
            }

            it("path in Tree should be location of file") {
                assertThat(understandCSVRow.pathInTree(),
                        `is`<Path>(Path(listOf("someDir", "anotherDir", "anotherName"))))
            }
        }

        context("considering row of unknown kind") {
            val rawRow: Array<String?> =
                    arrayOf("projectName", "blubb2", "blubb3", "someDir\\anotherDir\\anotherName", "name",
                            "someStupidKind")
            val understandCSVRow = UnderstandCSVRow(rawRow, header, pathSeparator)


            it("transforming toNode should throw exception") {
                assertFailsWith(IllegalArgumentException::class) {
                    understandCSVRow.asNode()
                }
            }

            it("path in Tree should be location of file") {
                assertThat(understandCSVRow.pathInTree(),
                        `is`<Path>(Path(listOf("someDir", "anotherDir", "anotherName"))))
            }
        }

        it("should throw exception if no path column present") {
            assertFailsWith(IllegalArgumentException::class) {
                UnderstandCSVRow(arrayOf("", ""), header, pathSeparator)
            }
        }

        it("should ignore columns if no attribute name in header") {
            val rawRow = arrayOf<String?>("1", "2", "3", "file", "", "File", "4", "5", "6", "7")
            val node = UnderstandCSVRow(rawRow, header, pathSeparator).asNode()
            assertThat(node.attributes.keys, hasSize(5))
        }

        it("should ignore column if not in row") {
            val rawRow = arrayOf<String?>("blubb1", "blubb2", "blubb3", "path", "", "File")
            val node = UnderstandCSVRow(rawRow, header, pathSeparator).asNode()
            assertThat(node.attributes.keys, not(hasItem("attrib")))
        }

        it("should have attribute for metric columns") {
            val rawRow = arrayOf<String?>("3,2", "2", "3", "file", "", "File")
            val node = UnderstandCSVRow(rawRow, header, pathSeparator).asNode()
            assertThat(node.attributes["head1"] as Double, `is`<Double>(3.2))
        }

        it("should have NO attribute for non-metric columns") {
            val rawRow = arrayOf<String?>("bla", "2", "3", "file", "", "File")
            val node = UnderstandCSVRow(rawRow, header, pathSeparator).asNode()
            assertThat(node.attributes["head1"], nullValue())
        }
    }
})