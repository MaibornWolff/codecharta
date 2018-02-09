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

package de.maibornwolff.codecharta.nodeinserter

import com.google.common.collect.ImmutableList
import de.maibornwolff.codecharta.model.*
import de.maibornwolff.codecharta.nodeinserter.NodeInserter.insertByPath
import org.hamcrest.BaseMatcher
import org.hamcrest.Description
import org.hamcrest.Matcher
import org.hamcrest.Matchers.*
import org.junit.Assert.assertThat
import org.junit.Test

class NodeInserterTest {
    private val root = Node("root", NodeType.Folder)

    private fun hasNodeAtPath(node: Node, path: Path): Matcher<Node> {
        return object : BaseMatcher<Node>() {
            private var nodeAtPath: Node? = null

            override fun describeTo(description: Description) {
                description.appendText("paths should contain ").appendValue(node).appendText(" at ").appendValue(path)
            }

            override fun matches(item: Any?): Boolean {
                nodeAtPath = root.getNodeBy(path) as Node
                return if (nodeAtPath == null) item == null else nodeAtPath == node
            }

            override fun describeMismatch(item: Any, description: Description) {
                description.appendText("but was ").appendValue(nodeAtPath)
                description.appendText(", where paths to leaves were ").appendValue((item as Node).pathsToLeaves)
            }
        }
    }

    @Test
    fun should_insert_node_in_leaf_position() {
        // given
        val nodeForInsertion = Node("insertedNode", NodeType.File)

        // when
        NodeInserter.insertByPath(root, Path.trivialPath(), nodeForInsertion)

        // then
        assertThat(root.children, hasSize(1))
        assertThat(root.pathsToLeaves.count(), `is`(1))
        assertThat(root, hasNodeAtPath(nodeForInsertion, Path("insertedNode")))
    }

    @Test
    fun should_not_insert_node_in_leaf_position_twice() {
        // given
        val nodeForInsertion = Node("insertedNode", NodeType.File)
        val secondNodeForInsertion = Node("insertedNode", NodeType.Folder)
        NodeInserter.insertByPath(root, Path.trivialPath(), nodeForInsertion)

        // when
        NodeInserter.insertByPath(root, Path.trivialPath(), secondNodeForInsertion)

        // then
        assertThat(root.children, hasSize(1))
        assertThat(root.pathsToLeaves.count(), `is`(1))
        assertThat(root, hasNodeAtPath(nodeForInsertion, Path("insertedNode")))
    }

    @Test
    fun should_take_intermediate_node_in_inner_position_if_present() {
        // given
        val nodeForInsertion = Node("insertedNode", NodeType.File)
        val intermediateNode = Node("folder", NodeType.Folder)
        root.children.add(intermediateNode)

        // when
        NodeInserter.insertByPath(root, Path("folder"), nodeForInsertion)

        // then
        println(root)
        assertThat(root.children, hasSize(1))
        assertThat(root.children, hasItem(intermediateNode))
        assertThat(root.pathsToLeaves.count(), `is`(1))
        assertThat(root, hasNodeAtPath(nodeForInsertion, Path("folder", "insertedNode")))
    }

    @Test
    fun should_insert_phantom_node_in_inner_position_if_no_intermediate_node_present() {
        // given
        val nodeForInsertion = Node("insertedNode", NodeType.File)
        val position = Path("folder")

        // when
        NodeInserter.insertByPath(root, position, nodeForInsertion)

        // then
        assertThat(root.children, hasSize(1))
        val createdPhantomNode = root.children[0]
        assertThat(createdPhantomNode.name, `is`("folder"))
    }

    @Test
    fun should_insert_node_in_end_position() {
        // given
        val nodeForInsertion = Node("insertedNode", NodeType.File)

        // when
        NodeInserter.insertByPath(root, Path("folder", "subfolder"), nodeForInsertion)

        // then
        assertThat(root.children, hasSize(1))
        assertThat(root.pathsToLeaves.count(), `is`(1))
        assertThat(root, hasNodeAtPath(nodeForInsertion, Path("folder", "subfolder", "insertedNode")))
    }

    @Test
    fun should_insert_node_in_end_position_even_if_ending_slash_not_present() {
        // given
        val nodeForInsertion = Node("insertedNode", NodeType.File)
        val path = Path("folder", "subfolder")

        // when
        NodeInserter.insertByPath(root, path, nodeForInsertion)

        // then
        assertThat(root.children, hasSize(1))
        assertThat(root.pathsToLeaves.count(), `is`(1))
        assertThat(root, hasNodeAtPath(nodeForInsertion, Path("folder", "subfolder", "insertedNode")))
    }

    @Test
    fun should_create_root_node_if_not_present() {
        // given
        val project = Project("someName")
        val nodeForInsertion = Node("someNode", NodeType.File)

        // when
        insertByPath(project, Path.trivialPath(), nodeForInsertion)

        // then
        assertThat(project.nodes, hasSize(1))
        val root = project.rootNode
        assertThat(root.children, hasSize(1))
        assertThat(root.children[0], `is`(nodeForInsertion))
    }

    @Test
    fun should_use_root_node_if_present() {
        // given
        val root = Node("root", NodeType.Folder)
        val project = Project("someName", ImmutableList.of(root))
        val nodeForInsertion = Node("someNode", NodeType.File)

        // when
        insertByPath(project, Path.trivialPath(), nodeForInsertion)

        // then
        assertThat(project.nodes, hasSize(1))
        assertThat(project.rootNode, NodeMatcher.matchesNode(root))
        assertThat(root.children, hasSize(1))
        assertThat(root.children[0], `is`(nodeForInsertion))
    }
}