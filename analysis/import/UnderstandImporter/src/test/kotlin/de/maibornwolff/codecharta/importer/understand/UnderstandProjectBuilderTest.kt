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

import de.maibornwolff.codecharta.model.NodeType
import org.hamcrest.MatcherAssert.assertThat
import org.hamcrest.Matchers.*
import org.spekframework.spek2.Spek
import org.spekframework.spek2.style.specification.describe

class UnderstandProjectBuilderTest: Spek({

    describe("UnderstandProjectBuilder for Understand") {
        val understandProjectBuilder = UnderstandProjectBuilder("test", '/')


        context("reading csv lines from Understand") {
            val project = understandProjectBuilder
                    .parseCSVStream(this.javaClass.classLoader.getResourceAsStream("understand.csv"))
                    .build()

            it("project has number number of files in csv") {
                assertThat(project.size, greaterThanOrEqualTo(223))
            }

            it("leaf has file attributes") {
                val attributes = project.rootNode.leafObjects.flatMap { it.attributes.keys }.distinct()
                assertThat(attributes, hasItem("rloc"))
            }

            it("leaf has class attributes") {
                val attributes = project.rootNode.leafObjects.flatMap { it.attributes.keys }.distinct()
                assertThat(attributes, hasItem("max_cbo"))
            }

            it("has no nodes other than files and folders") {
                val nonFileNonFolderNodes = project.rootNode.nodes.values
                        .filter { it.type != NodeType.Folder && it.type != NodeType.File }
                assertThat(nonFileNonFolderNodes, hasSize(0))
            }

            it("has no folder nodes as leaves") {
                val folderLeaves = project.rootNode.leafObjects
                        .filter { it.type == NodeType.Folder }
                assertThat(folderLeaves, hasSize(0))
            }
        }

        context("reading csv lines from Understand with LF breaks") {
            val project = understandProjectBuilder
                    .parseCSVStream(this.javaClass.classLoader.getResourceAsStream("understand_lf.csv"))
                    .build()

            it("project has number number of files in csv") {
                assertThat(project.size, greaterThanOrEqualTo(223))
            }

        }

    }

})