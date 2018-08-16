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

import de.maibornwolff.codecharta.model.NodeMatcher.hasNodeAtPath
import org.hamcrest.MatcherAssert.assertThat
import org.hamcrest.Matchers.*
import org.jetbrains.spek.api.Spek
import org.jetbrains.spek.api.dsl.it

class NodeInserterTest : Spek({
    it("should insert node in leaf position") {
        // given
        val root = MutableNode("root", NodeType.Folder)

        val nodeForInsertion = MutableNode("insertedNode", NodeType.File)

        // when
        NodeInserter.insertByPath(root, Path.trivialPath(), nodeForInsertion)

        // then
        assertThat(root.children, hasSize(1))
        assertThat(root.pathsToLeaves.count(), `is`(1))
        assertThat(root.toNode(), hasNodeAtPath(nodeForInsertion.toNode(), Path("insertedNode")))
    }

    it("should not insert node in leaf position twice") {
        // given
        val root = MutableNode("root", NodeType.Folder)

        val nodeForInsertion = MutableNode("insertedNode", NodeType.File)
        val secondNodeForInsertion = MutableNode("insertedNode", NodeType.Folder)
        NodeInserter.insertByPath(root, Path.trivialPath(), nodeForInsertion)

        // when
        NodeInserter.insertByPath(root, Path.trivialPath(), secondNodeForInsertion)

        // then
        assertThat(root.children, hasSize(1))
        assertThat(root.pathsToLeaves.count(), `is`(1))
        assertThat(root.toNode(), hasNodeAtPath(nodeForInsertion.toNode(), Path("insertedNode")))
    }

    it("should take intermediate node in inner position if present") {
        // given
        val root = MutableNode("root", NodeType.Folder)

        val nodeForInsertion = MutableNode("insertedNode", NodeType.File)
        val intermediateNode = MutableNode("folder", NodeType.Folder)
        root.children.add(intermediateNode)

        // when
        NodeInserter.insertByPath(root, Path("folder"), nodeForInsertion)

        // then
        assertThat(root.children, hasSize(1))
        assertThat(root.children, hasItem(intermediateNode))
        assertThat(root.pathsToLeaves.count(), `is`(1))
        assertThat(root.toNode(), hasNodeAtPath(nodeForInsertion.toNode(), Path("folder", "insertedNode")))
    }

    it("should insert phantom node in inner position if no intermediate node present") {
        // given
        val root = MutableNode("root", NodeType.Folder)

        val nodeForInsertion = MutableNode("insertedNode", NodeType.File)
        val position = Path("folder")

        // when
        NodeInserter.insertByPath(root, position, nodeForInsertion)

        // then
        assertThat(root.children, hasSize(1))
        val createdPhantomNode = root.children[0]
        assertThat(createdPhantomNode.name, `is`("folder"))
    }

    it("should insert node in end position") {
        // given
        val root = MutableNode("root", NodeType.Folder)

        val nodeForInsertion = MutableNode("insertedNode", NodeType.File)

        // when
        NodeInserter.insertByPath(root, Path("folder", "subfolder"), nodeForInsertion)

        // then
        assertThat(root.children, hasSize(1))
        assertThat(root.pathsToLeaves.count(), `is`(1))
        assertThat(root.toNode(), hasNodeAtPath(nodeForInsertion.toNode(), Path("folder", "subfolder", "insertedNode")))
    }

    it("should insert node in end position even if ending slash not present") {
        // given
        val root = MutableNode("root", NodeType.Folder)

        val nodeForInsertion = MutableNode("insertedNode", NodeType.File)
        val path = Path("folder", "subfolder")

        // when
        NodeInserter.insertByPath(root, path, nodeForInsertion)

        // then
        assertThat(root.children, hasSize(1))
        assertThat(root.pathsToLeaves.count(), `is`(1))
        assertThat(root.toNode(), hasNodeAtPath(nodeForInsertion.toNode(), Path("folder", "subfolder", "insertedNode")))
    }
})