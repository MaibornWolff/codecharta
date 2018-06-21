/*
 * Copyright (c) 2017, MaibornWolff GmbH
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

package de.maibornwolff.codecharta.model

import org.hamcrest.CoreMatchers.`is`
import org.hamcrest.MatcherAssert.assertThat
import org.hamcrest.Matchers.hasItem
import org.hamcrest.Matchers.hasSize
import org.jetbrains.spek.api.Spek
import org.jetbrains.spek.api.dsl.describe
import org.jetbrains.spek.api.dsl.it
import org.jetbrains.spek.api.dsl.on
import java.util.*
import kotlin.test.assertFailsWith

class NodeTest : Spek({

    describe("root with child") {

        val childName = "child1"
        val child = MutableNode(childName)
        val root = MutableNode("root", NodeType.Folder, childrenList = Arrays.asList(child))

        on("getPathOfChild of valid child") {
            val pathOfChild = root.getPathOfChild(child)

            it("should return path") {

                assertThat(pathOfChild.isSingle, `is`(true))
                assertThat(pathOfChild.head, `is`(childName))
            }
        }

        on("getPathOfChild of invalid child") {

            it("should throw an exception") {

                assertFailsWith(NoSuchElementException::class) {
                    root.getPathOfChild(MutableNode("invalidChild"))
                }
            }
        }

        on("pathsToLeafs") {

            val pathsToLeafs = root.pathsToLeaves

            it("should return path of child") {

                assertThat(pathsToLeafs, hasSize(1))
                assertThat(pathsToLeafs, PathMatcher.containsPath(Path(childName)))
            }
        }

    }

    describe("root node with many children") {

        val node11 = MutableNode("node11")
        val node12 = MutableNode("node12")
        val node1 = MutableNode("node1", NodeType.Folder, childrenList = Arrays.asList(node11, node12))
        val node21 = MutableNode("node21", NodeType.Folder)
        val node2 = MutableNode("node2", NodeType.Folder, childrenList = Arrays.asList(node21))
        val root = MutableNode("root", NodeType.Folder, childrenList = Arrays.asList(node1, node2))

        on("getLeafs") {

            val leafs = root.leafObjects

            it("should return leafs") {

                assertThat(leafs, hasSize(3))
                assertThat(leafs, hasItem(node11))
                assertThat(leafs, hasItem(node12))
                assertThat(leafs, hasItem(node21))
            }
        }

        on("getPathsToLeafs") {

            val pathsToLeafs = root.pathsToLeaves

            it("should return paths of all leafs") {

                assertThat(pathsToLeafs, hasSize(3))
                assertThat(pathsToLeafs, PathMatcher.containsPath(Path("node1", "node11")))
                assertThat(pathsToLeafs, PathMatcher.containsPath(Path("node1", "node12")))
                assertThat(pathsToLeafs, PathMatcher.containsPath(Path("node2", "node21")))
            }
        }

    }
})