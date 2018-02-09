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

class RecursiveNodeMergerTest {
    private val merger = RecursiveNodeMergerStrategy()

    @Test
    fun should_merge_nodes_with_same_name() {
        // given
        val node1 = Node("Name", NodeType.File)
        val node2 = Node("Name", NodeType.Folder)

        // when
        val nodeList = merger.mergeNodeLists(listOf(listOf(node1), listOf(node2)))

        // then
        assertThat(nodeList, hasSize(1))
    }

    @Test
    fun merging_nodes_should_merge_children() {
        // given
        val child1 = Node("child1", NodeType.File)
        val child2 = Node("child2", NodeType.Folder)
        val child1_littleBitDifferent = Node("child1", NodeType.File, mapOf(Pair("someAttribute", 1.0f)), "", listOf())
        val node1 = Node("Name", NodeType.File, mapOf(), "", listOf(child1_littleBitDifferent))
        val node2 = Node("Name", NodeType.File, mapOf(), "", listOf(child1, child2))

        // when
        val newNode = merger.mergeNodeLists(listOf(listOf(node1), listOf(node2)))[0]

        // then
        assertThat(newNode.children, hasSize(2))
        assertThat(newNode.children[0].name, `is`(child1.name))
        assertThat(newNode.children[0].type, `is`(child1.type))
        assertThat(newNode.children[1].name, `is`(child2.name))
        assertThat(newNode.children[1].type, `is`(child2.type))
    }

    @Test
    fun merging_empty_nodes_should_return_empty_nodelist() {
        // given
        val emptyNodeList = listOf<List<Node>>()

        // when
        val nodeList = merger.mergeNodeLists(emptyNodeList)

        // then
        assertThat(nodeList, hasSize(0))
    }

    @Test
    fun merging_single_nodeList_should_return_same_nodelist() {
        // given
        val nodeList = listOf(Node("node", NodeType.File, mapOf()))

        // when
        val actualNodeList = merger.mergeNodeLists(listOf(nodeList))

        // then
        assertThat(actualNodeList, `is`(nodeList))
    }

    @Test
    fun merging_nodeList_with_two_root_nodes_should_return_two_root_nodes() {
        // given
        val node11 = Node("Name1", NodeType.File)
        val node12 = Node("Name2", NodeType.File)
        val node2 = Node("Name1", NodeType.Folder)

        // when
        val nodeList = merger.mergeNodeLists(listOf(listOf(node11, node12), listOf(node2)))

        // then
        assertThat(nodeList, hasSize(2))
    }

}