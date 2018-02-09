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
import de.maibornwolff.codecharta.model.Path
import org.hamcrest.CoreMatchers.`is`
import org.hamcrest.Matchers.hasSize
import org.junit.Assert.assertThat
import org.junit.Test

class LeafNodeMergerTest {
    private val fittingMerger = LeafNodeMergerStrategy(false)

    @Test
    fun should_merge_nodes_with_same_name() {
        // given
        val node1 = Node("Name", NodeType.File)
        val node2 = Node("Name", NodeType.Folder)

        // when
        val nodeList = fittingMerger.mergeNodeLists(listOf(listOf(node1), listOf(node2)))

        // then
        assertThat(nodeList, hasSize(1))
    }

    @Test
    fun merging_nodes_should_merge_children() {
        val misfittingMerger = LeafNodeMergerStrategy(true)

        // given
        val child1 = Node("child1", NodeType.File)
        val child2 = Node("child2", NodeType.Folder)
        val child1_littleBitDifferent = Node("child1", NodeType.File, mapOf(Pair("someAttribute", 1.0f)), "", listOf())
        val node1 = Node("Name", NodeType.File, mapOf(), "", listOf(child1_littleBitDifferent))
        val node2 = Node("Name", NodeType.File, mapOf(), "", listOf(child1, child2))

        // when
        val newNode = misfittingMerger.mergeNodeLists(listOf(listOf(node1), listOf(node2)))[0]

        // then
        assertThat(newNode.children, hasSize(2))
        assertThat(newNode.children[0].name, `is`(child1.name))
        assertThat(newNode.children[0].type, `is`(child1.type))
        assertThat(newNode.children[1].name, `is`(child2.name))
        assertThat(newNode.children[1].type, `is`(child2.type))
    }

    @Test
    fun merging_nodes_should_merge_children2() {
        // given
        val child1 = Node("child1", NodeType.File)
        val child2 = Node("child2", NodeType.Folder)
        val child1_littleBitDifferent = Node("child1", NodeType.File, mapOf(Pair("someAttribute", 1.0f)), "", listOf())
        val node1 = Node("Name", NodeType.File, mapOf(), "", listOf(child1_littleBitDifferent))
        val node2 = Node("Name", NodeType.File, mapOf(), "", listOf(child1, child2))

        // when
        val newNode = fittingMerger.mergeNodeLists(listOf(listOf(node2), listOf(node1)))[0]

        // then
        assertThat(newNode.children, hasSize(2))
        assertThat(newNode.children[0].name, `is`(child1.name))
        assertThat(newNode.children[0].type, `is`(child1.type))
        assertThat(newNode.children[0].attributes.size, `is`(1))
        assertThat(newNode.children[1].name, `is`(child2.name))
        assertThat(newNode.children[1].type, `is`(child2.type))
    }

    @Test
    fun merging_nodes_should_merge_leafs() {
        // given
        val child1_littleBitDifferent = Node("child1", NodeType.File, mapOf(Pair("someAttribute", 1.0f)), "", listOf())
        val node1 = Node("root", NodeType.File, mapOf(), "", listOf(child1_littleBitDifferent))
        val child1 = Node("child1", NodeType.File)
        val intermediateNode = Node("intermediateNode", NodeType.File, mapOf(), "", listOf(child1))
        val node2 = Node("root", NodeType.File, mapOf(), "", listOf(intermediateNode))

        // when
        val newNode = fittingMerger.mergeNodeLists(listOf(listOf(node1), listOf(node2)))[0]

        // then
        assertThat(newNode.children, hasSize(1))
        assertThat(newNode.children[0].name, `is`(child1.name))
        assertThat(newNode.children[0].type, `is`(child1.type))
    }

    @Test
    fun merging_empty_nodes_should_return_empty_nodelist() {
        // given
        val emptyNodeList = listOf<List<Node>>()

        // when
        val nodeList = fittingMerger.mergeNodeLists(emptyNodeList)

        // then
        assertThat(nodeList, hasSize(0))
    }

    @Test
    fun merging_single_nodeList_should_return_same_nodelist() {
        // given
        val nodeList = listOf(Node("node", NodeType.File, mapOf()))

        // when
        val actualNodeList = fittingMerger.mergeNodeLists(listOf(nodeList))

        // then
        assertThat(actualNodeList, `is`(nodeList))
    }


    @Test
    fun merging_nodes_should_merge_children3(){
        // given
        val childA = Node("A", NodeType.File, mapOf("a" to 0))
        val childB = Node("B", NodeType.Folder, mapOf(), "", listOf(Node("A", NodeType.File)))
        val root1 = Node("root", NodeType.Folder, mapOf(), "", listOf(childA, childB))

        val childA2 = Node("A", NodeType.File)
        val childB2 = Node("B", NodeType.Folder, mapOf(), "", listOf(Node("A", NodeType.File)))
        val root2 = Node("root", NodeType.Folder, mapOf(), "", listOf(childA2, childB2))

        // when
        val newRoot = fittingMerger.mergeNodeLists(listOf(listOf(root1), listOf(root2)))[0]

        // then
        assertThat(newRoot.children, hasSize(2))
        assertThat((newRoot.getNodeBy(Path(listOf("B", "A"))) as Node).attributes.size, `is`(0))
    }
}