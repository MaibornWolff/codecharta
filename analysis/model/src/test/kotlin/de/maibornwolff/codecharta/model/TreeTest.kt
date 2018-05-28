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

import de.maibornwolff.codecharta.model.TreeCreator.createTree
import org.hamcrest.MatcherAssert.assertThat
import org.hamcrest.Matchers.`is`
import org.hamcrest.Matchers.hasItem
import org.jetbrains.spek.api.Spek
import org.jetbrains.spek.api.dsl.describe
import org.jetbrains.spek.api.dsl.it
import org.jetbrains.spek.api.dsl.on
import java.util.*
import kotlin.test.assertFailsWith

class TreeTest : Spek({
    describe("a tree of depth 0") {
        val tree = createTree()

        on("nodes") {
            val nodes = tree.nodes

            it("should be only the tree itself") {
                assertThat(nodes.size, `is`(1))
                assertThat(nodes.keys, hasItem(Path.TRIVIAL))
                assertThat(nodes.values, hasItem(tree))
            }
        }

        on("leaves") {
            val leaves = tree.leaves

            it("should be only the tree itself") {
                assertThat(leaves.size, `is`(1))
                assertThat(leaves.keys, hasItem(Path.TRIVIAL))
                assertThat(leaves.values, hasItem(tree))
            }
        }

        on("getNodeBy") {
            it("should return same tree on trivial path") {
                assertThat(tree.getNodeBy(Path.TRIVIAL), `is`(tree))
            }

            it("should throw exception on path not contained in tree") {
                assertFailsWith(NoSuchElementException::class) {
                    tree.getNodeBy(Path("nonexistingpath"))
                }
            }
        }

        on("merge") {
            tree.merge(listOf(createTree().asTreeNode()))

            it("should do nothing by default") {
                val leaves = tree.leaves

                assertThat(leaves.size, `is`(1))
                assertThat(leaves.keys, hasItem(Path.TRIVIAL))
                assertThat(leaves.values, hasItem(tree))
            }
        }
    }

    describe("a tree of depth 1") {
        val innerTree = createTree()
        val pathToInnerTree = Path("bla")
        val tree = createTree(pathToInnerTree, innerTree)

        on("nodes") {
            val nodes = tree.nodes

            it("should contain exactly itself and the subtree") {
                assertThat(nodes.size, `is`(2))
                assertThat(nodes.keys, hasItem(Path.TRIVIAL))
                assertThat(nodes.keys, hasItem(pathToInnerTree))
                assertThat(nodes.values, hasItem(tree))
                assertThat(nodes.values, hasItem(innerTree))
            }
        }

        on("leaves") {
            val leaves = tree.leaves

            it("should return the inner tree") {
                assertThat(leaves.size, `is`(1))
                assertThat(leaves.keys, hasItem(pathToInnerTree))
                assertThat(leaves.values, hasItem(innerTree))
            }
        }

        on("getNodeBy") {
            it("should return same tree on trivial path") {
                assertThat(tree.getNodeBy(Path.TRIVIAL), `is`(tree))
            }

            it("should return inner tree on pathToInnerTree") {
                assertThat(tree.getNodeBy(pathToInnerTree), `is`(innerTree))
            }

            it("should throw exception on path not contained in tree") {
                assertFailsWith(NoSuchElementException::class) {
                    tree.getNodeBy(Path("nonexistingpath"))
                }
            }
        }
    }
})