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

import com.google.common.collect.ImmutableMap
import org.hamcrest.CoreMatchers.`is`
import org.hamcrest.CoreMatchers.hasItem
import org.hamcrest.MatcherAssert.assertThat
import org.hamcrest.Matchers.hasSize
import org.junit.Test
import java.util.*

class NodeTest {

    @Test
    fun getPathOfChild_of_valid_child_should_return_path() {
        // given
        val node11 = Node("node11", NodeType.File)
        val node1Children = Arrays.asList(node11)
        val root = Node("node1", NodeType.Folder, ImmutableMap.of(), "", node1Children)

        // when
        val pathOfChild = root.getPathOfChild(node11)

        // then
        assertThat(pathOfChild.isSingle, `is`(true))
        assertThat(pathOfChild.head, `is`("node11"))
    }

    @Test(expected = NoSuchElementException::class)
    fun getPathOfChild_of_invalid_child_should_throw_exception() {
        // given
        val node11 = Node("node11", NodeType.File)
        val node1Children = Arrays.asList(node11)
        val root = Node("node1", NodeType.Folder, ImmutableMap.of(), "", node1Children)

        // when
        root.getPathOfChild(Node("node11", NodeType.Folder))

        // then throw
    }

    @Test
    fun getLeafs_should_return_leafs() {
        // given
        val node11 = Node("node11", NodeType.File)
        val node12 = Node("node12", NodeType.File)
        val node1Children = Arrays.asList(node11, node12)
        val node1 = Node("node1", NodeType.Folder, ImmutableMap.of(), "", node1Children)
        val node21 = Node("node21", NodeType.Folder)
        val node2Children = Arrays.asList(node21)
        val node2 = Node("node2", NodeType.Folder, ImmutableMap.of(), "", node2Children)
        val root = Node("root", NodeType.Folder, ImmutableMap.of(), "", Arrays.asList(node1, node2))

        // when
        val leafs = root.leafObjects

        // then
        assertThat(leafs, hasSize(3))
        assertThat(leafs, hasItem(node11))
        assertThat(leafs, hasItem(node12))
        assertThat(leafs, hasItem(node21))
    }

    @Test
    fun getPathsToLeafs_of_simple_tree() {
        // given
        val node1 = Node("node1", NodeType.Folder)
        val pathToNode1 = Path("node1")
        val root = Node("root", NodeType.Folder, ImmutableMap.of(), "", Arrays.asList(node1))

        // when
        val pathsToLeafs = root.pathsToLeaves

        // then
        assertThat(pathsToLeafs, hasSize(1))
        assertThat(pathsToLeafs, PathMatcher.containsPath(pathToNode1))
    }

    @Test
    fun getPathsToLeafs() {
        // given
        val node11 = Node("node11", NodeType.File)
        val pathToNode11 = Path("node1", "node11")
        val node12 = Node("node12", NodeType.File)
        val pathToNode12 = Path("node1", "node12")
        val node1Children = Arrays.asList(node11, node12)
        val node1 = Node("node1", NodeType.Folder, ImmutableMap.of(), "", node1Children)
        val node21 = Node("node21", NodeType.Folder)
        val pathToNode21 = Path("node2", "node21")
        val node2Children = Arrays.asList(node21)
        val node2 = Node("node2", NodeType.Folder, ImmutableMap.of(), "", node2Children)
        val root = Node("root", NodeType.Folder, ImmutableMap.of(), "", Arrays.asList(node1, node2))

        // when
        val pathsToLeafs = root.pathsToLeaves

        // then
        assertThat(pathsToLeafs, hasSize(3))
        assertThat(pathsToLeafs, PathMatcher.containsPath(pathToNode11))
        assertThat(pathsToLeafs, PathMatcher.containsPath(pathToNode12))
        assertThat(pathsToLeafs, PathMatcher.containsPath(pathToNode21))
    }
}