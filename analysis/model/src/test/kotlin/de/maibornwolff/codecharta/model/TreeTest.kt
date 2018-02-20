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
import org.hamcrest.Matchers.`is`
import org.junit.Assert.assertThat
import org.junit.Test
import java.util.*

class TreeTest {
    @Test
    fun getNodeBy_trivial_should_return_same_tree() {
        val tree = createTree(Path(Arrays.asList("bla")), createTree())

        assertThat(tree.getNodeBy(Path.TRIVIAL), `is`<Any>(tree))
    }

    @Test
    fun getNode_of_simple_tree_should_return_this_tree() {
        val tree = createTree()

        val nodes = tree.nodes

        assertThat(nodes.size, `is`(1))
        assertThat(nodes.keys.contains(Path.TRIVIAL), `is`(true))
        assertThat(nodes.values.contains(tree), `is`(true))
    }

    @Test
    fun getLeaves_of_simple_tree_should_return_this_leaf() {
        val tree = createTree()

        val leaves = tree.leaves

        assertThat(leaves.size, `is`(1))
        assertThat(leaves.keys.contains(Path.TRIVIAL), `is`(true))
        assertThat(leaves.values.contains(tree), `is`(true))
    }

    @Test
    fun getNode_should_return_nodes() {
        val innerTree = createTree()
        val pathToInnerTree = Path(Arrays.asList("bla"))
        val tree = createTree(pathToInnerTree, innerTree)

        val nodes = tree.nodes

        assertThat(nodes.size, `is`(2))
        assertThat(nodes.keys.contains(Path.TRIVIAL), `is`(true))
        assertThat(nodes.values.contains(tree), `is`(true))
        assertThat(nodes.keys.contains(pathToInnerTree), `is`(true))
        assertThat(nodes.values.contains(innerTree), `is`(true))
    }

    @Test
    fun getLeaves_should_return_leaves() {
        val innerTree = createTree()
        val pathToInnerTree = Path(Arrays.asList("bla"))
        val tree = createTree(pathToInnerTree, innerTree)

        val leaves = tree.leaves

        assertThat(leaves.size, `is`(1))
        assertThat(leaves.keys.contains(pathToInnerTree), `is`(true))
        assertThat(leaves.values.contains(innerTree), `is`(true))
    }
}