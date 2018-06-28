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
import org.hamcrest.Matchers.hasSize
import org.jetbrains.spek.api.Spek
import org.jetbrains.spek.api.dsl.describe
import org.jetbrains.spek.api.dsl.it
import org.jetbrains.spek.api.dsl.on

class NodeMergerTest : Spek({
    describe("a node merger NodeMaxAttributeMergerIgnoringChildren") {

        on("merging nodes with same name") {
            val name = "Name"
            val type = NodeType.File
            val link = "node1"
            val attrib1 = mapOf("attrib11" to 1.0)
            val node1 = MutableNode(name, type, attrib1, link, nodeMergingStrategy = NodeMaxAttributeMergerIgnoringChildren)
            val node2 = MutableNode(name, type)

            val newNode = node1.merge(listOf(node2))

            it("should return merged node") {
                assertThat(newNode.name, `is`(name))
            }

            it("should prevail type") {
                assertThat(newNode.type, `is`(type))
            }

            it("should prevail link") {
                assertThat(newNode.link, `is`(link))
            }

            it("should merge attributes") {
                assertThat(newNode.attributes.count(), `is`(1))
                assertThat(newNode.attributes["attrib11"], `is`(1.0 as Any))
            }
        }

        on("merging nodes with children") {
            val child1 = MutableNode("child1", NodeType.File)
            val child2 = MutableNode("child2", NodeType.Folder)
            val child1_littleBitDifferent = MutableNode("child1", NodeType.File, mapOf(Pair("someAttribute", 1.0f)), "", listOf())
            val node1 = MutableNode("Name", NodeType.File, mapOf(), "", listOf(child1_littleBitDifferent), nodeMergingStrategy = NodeMaxAttributeMergerIgnoringChildren)
            val node2 = MutableNode("Name", NodeType.File, mapOf(), "", listOf(child1, child2))

            val newNode = node1.merge(listOf(node2))

            // then
            it("should NOT merge children") {
                assertThat(newNode.children, hasSize(0))
            }
        }
    }
})
