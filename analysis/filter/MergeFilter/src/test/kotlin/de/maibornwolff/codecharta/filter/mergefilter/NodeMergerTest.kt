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

import de.maibornwolff.codecharta.model.Node
import de.maibornwolff.codecharta.model.NodeType
import org.hamcrest.CoreMatchers.`is`
import org.hamcrest.Matchers.hasSize
import org.junit.Assert.assertThat
import org.junit.Test

class NodeMergerTest {
    private var merger = NodeMerger()

    @Test
    fun merging_nodes_should_prevail_name() {
        // given
        val name = "Name"
        val node1 = Node(name, NodeType.Folder, mapOf(), "node1")
        val node2 = Node(name, NodeType.Folder)

        // when
        val newNode = merger.merge(node1, node2)

        // then
        assertThat(newNode.name, `is`(name))
    }

    @Test
    fun merging_nodes_should_prevail_type() {
        // given
        val type = NodeType.File
        val node1 = Node("Name", type, mapOf(), "node1")
        val node2 = Node("Name", type)

        // when
        val newNode = merger.merge(node1, node2)

        // then
        assertThat(newNode.type, `is`(type))
    }

    @Test
    fun merging_nodes_should_prevail_link() {
        // given
        val link = "node1"
        val node1 = Node("Name", NodeType.File, mapOf(), link)
        val node2 = Node("Name", NodeType.File)

        // when
        val newNode = merger.merge(node1, node2)

        // then
        assertThat(newNode.link, `is`(link))
    }

    @Test
    fun merging_nodes_should_merge_attibutes() {
        // given
        val attrib1 = mapOf("attrib11" to 1.0)
        val node1 = Node("Name", NodeType.File, attrib1)
        val node2 = Node("Name", NodeType.File)

        // when
        val newNode = merger.merge(node1, node2)

        // then
        assertThat(newNode.attributes.count(), `is`(1))
        assertThat(newNode.attributes["attrib11"], `is`(1.0 as Any))
    }

    @Test
    fun merging_nodes_should_not_merge_children() {
        // given
        val child1 = Node("child1", NodeType.File)
        val child2 = Node("child2", NodeType.Folder)
        val child1_littleBitDifferent = Node("child1", NodeType.File, mapOf(Pair("someAttribute", 1.0f)), "", listOf())
        val node1 = Node("Name", NodeType.File, mapOf(), "", listOf(child1_littleBitDifferent))
        val node2 = Node("Name", NodeType.File, mapOf(), "", listOf(child1, child2))

        // when
        val newNode = merger.merge(node1, node2)

        // then
        assertThat(newNode.children, hasSize(0))
    }

}