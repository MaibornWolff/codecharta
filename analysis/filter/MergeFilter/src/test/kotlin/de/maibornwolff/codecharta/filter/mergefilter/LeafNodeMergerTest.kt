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

package de.maibornwolff.codecharta.filter.mergefilter

import de.maibornwolff.codecharta.model.MutableNode
import de.maibornwolff.codecharta.model.NodeType
import de.maibornwolff.codecharta.model.Path
import org.hamcrest.MatcherAssert.assertThat
import org.hamcrest.Matchers.`is`
import org.hamcrest.Matchers.hasSize
import org.jetbrains.spek.api.Spek
import org.jetbrains.spek.api.dsl.describe
import org.jetbrains.spek.api.dsl.it
import org.jetbrains.spek.api.dsl.on

class LeafNodeMergerTest : Spek({
    describe("a fitting merger") {
        val fittingMerger = LeafNodeMergerStrategy(false)

        on("merging nodes with same name") {
            val node1 = MutableNode("Name", NodeType.File)
            val node2 = MutableNode("Name", NodeType.Folder)

            val nodeList = fittingMerger.mergeNodeLists(listOf(listOf(node1), listOf(node2)))

            it("should return merged node") {
                assertThat(nodeList, hasSize(1))
            }
        }

        on("merging nodes with children and with same name") {
            val child1 = MutableNode("child1", NodeType.File)
            val child2 = MutableNode("child2", NodeType.Folder)
            val child1_littleBitDifferent =
                    MutableNode("child1", NodeType.File, mapOf(Pair("someAttribute", 1.0f)), "", listOf())
            val node1 = MutableNode("Name", NodeType.File, mapOf(), "", listOf(child1_littleBitDifferent))
            val node2 = MutableNode("Name", NodeType.File, mapOf(), "", listOf(child1, child2))

            val newNode = fittingMerger.mergeNodeLists(listOf(listOf(node2), listOf(node1)))[0]

            it("should merge children") {
                assertThat(newNode.children, hasSize(2))
                assertThat(newNode.children[0].name, `is`(child1.name))
                assertThat(newNode.children[0].type, `is`(child1.type))
                assertThat(newNode.children[1].name, `is`(child2.name))
                assertThat(newNode.children[1].type, `is`(child2.type))
            }

            it("should merge attributes") {
                assertThat(newNode.children[0].attributes.size, `is`(1))
            }
        }

        on("merging nodes with children and with same name") {
            // given
            val childA = MutableNode("A", NodeType.File, mapOf("a" to 0))
            val childB = MutableNode("B", NodeType.Folder, mapOf(), "", listOf(MutableNode("A", NodeType.File)))
            val root1 = MutableNode("root", NodeType.Folder, mapOf(), "", listOf(childA, childB))

            val childA2 = MutableNode("A", NodeType.File)
            val childB2 = MutableNode("B", NodeType.Folder, mapOf(), "", listOf(MutableNode("A", NodeType.File)))
            val root2 = MutableNode("root", NodeType.Folder, mapOf(), "", listOf(childA2, childB2))

            // when
            val newRoot = fittingMerger.mergeNodeLists(listOf(listOf(root1), listOf(root2)))[0]

            it("should merge children") {
                assertThat(newRoot.children, hasSize(2))
                assertThat((newRoot.getNodeBy(Path(listOf("B", "A"))) as MutableNode).attributes.size, `is`(0))
            }
        }

        it("should merge leafs") {
            // given
            val child1_littleBitDifferent =
                    MutableNode("child1", NodeType.File, mapOf(Pair("someAttribute", 1.0f)), "", listOf())
            val node1 = MutableNode("root", NodeType.File, mapOf(), "", listOf(child1_littleBitDifferent))
            val child1 = MutableNode("child1", NodeType.File)
            val intermediateNode = MutableNode("intermediateNode", NodeType.File, mapOf(), "", listOf(child1))
            val node2 = MutableNode("root", NodeType.File, mapOf(), "", listOf(intermediateNode))

            // when
            val newNode = fittingMerger.mergeNodeLists(listOf(listOf(node1), listOf(node2)))[0]

            // then
            assertThat(newNode.children, hasSize(1))
            assertThat(newNode.children[0].name, `is`(child1.name))
            assertThat(newNode.children[0].type, `is`(child1.type))
        }

        on("merging empty nodes") {
            val nodeList = fittingMerger.mergeNodeLists(listOf())

            it("should return empty node list") {
                assertThat(nodeList, hasSize(0))
            }
        }

        on("merging single node list") {
            val nodeList = listOf(MutableNode("node", NodeType.File, mapOf()))
            val actualNodeList = fittingMerger.mergeNodeLists(listOf(nodeList))

            it("should return same node list") {
                assertThat(actualNodeList, `is`(nodeList))
            }
        }
    }

    describe("a misfitting merger") {
        val misfittingMerger = LeafNodeMergerStrategy(true)
        on("merging nodes with children and with same name") {
            val child1 = MutableNode("child1", NodeType.File)
            val child2 = MutableNode("child2", NodeType.Folder)
            val child1_littleBitDifferent =
                    MutableNode("child1", NodeType.File, mapOf(Pair("someAttribute", 1.0f)), "", listOf())
            val node1 = MutableNode("Name", NodeType.File, mapOf(), "", listOf(child1_littleBitDifferent))
            val node2 = MutableNode("Name", NodeType.File, mapOf(), "", listOf(child1, child2))

            val newNode = misfittingMerger.mergeNodeLists(listOf(listOf(node1), listOf(node2)))[0]

            it("should merge children") {
                assertThat(newNode.children, hasSize(2))
                assertThat(newNode.children[0].name, `is`(child1.name))
                assertThat(newNode.children[0].type, `is`(child1.type))
                assertThat(newNode.children[1].name, `is`(child2.name))
                assertThat(newNode.children[1].type, `is`(child2.type))
            }
        }

    }
})
