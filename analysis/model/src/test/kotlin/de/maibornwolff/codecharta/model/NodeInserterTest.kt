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
import org.spekframework.spek2.Spek
import org.spekframework.spek2.style.specification.describe

class NodeInserterTest : Spek({

    describe("NodeInserter") {
        context("Inserting a node at root") {
            val root = MutableNode("root", NodeType.Folder)
            val nodeForInsertion = MutableNode("insertedNode", NodeType.File)
            NodeInserter.insertByPath(root, Path.trivialPath(), nodeForInsertion)


            it("should insert node in leaf position") {
                assertThat(root.children, hasSize(1))
                assertThat(root.pathsToLeaves.count(), `is`(1))
                assertThat(root.toNode(), hasNodeAtPath(nodeForInsertion.toNode(), Path("insertedNode")))
            }
        }

        context("Inserting a node at root twice") {
            val root = MutableNode("root", NodeType.Folder)

            val nodeForInsertion = MutableNode("insertedNode", NodeType.File)
            val secondNodeForInsertion = MutableNode("insertedNode", NodeType.Folder)
            NodeInserter.insertByPath(root, Path.trivialPath(), nodeForInsertion)

            NodeInserter.insertByPath(root, Path.trivialPath(), secondNodeForInsertion)

            it("should  insert node in leaf position only once") {
                assertThat(root.children, hasSize(1))
                assertThat(root.pathsToLeaves.count(), `is`(1))
                assertThat(root.toNode(), hasNodeAtPath(nodeForInsertion.toNode(), Path("insertedNode")))
            }
        }

        context("Inserting a node with intermediate position already present") {
            val root = MutableNode("root", NodeType.Folder)
            val intermediateNode = MutableNode("folder", NodeType.Folder)
            root.children.add(intermediateNode)

            val nodeForInsertion = MutableNode("insertedNode", NodeType.File)
            NodeInserter.insertByPath(root, Path("folder"), nodeForInsertion)

            it("should insert node in leaf position") {
                assertThat(root.children, hasSize(1))
                assertThat(root.children, hasItem(intermediateNode))
                assertThat(root.pathsToLeaves.count(), `is`(1))
                assertThat(root.toNode(), hasNodeAtPath(nodeForInsertion.toNode(), Path("folder", "insertedNode")))
            }
        }

        context("Inserting a node without intermediate position already present") {
            val root = MutableNode("root", NodeType.Folder)
            val nodeForInsertion = MutableNode("insertedNode", NodeType.File)
            val position = Path("folder")
            NodeInserter.insertByPath(root, position, nodeForInsertion)

            it("should insert phantom node in inner position") {
                assertThat(root.children, hasSize(1))
                val createdPhantomNode = root.children[0]
                assertThat(createdPhantomNode.name, `is`("folder"))
            }
        }

        context("Inserting node in end position") {
            val root = MutableNode("root", NodeType.Folder)
            val nodeForInsertion = MutableNode("insertedNode", NodeType.File)
            NodeInserter.insertByPath(root, Path("folder", "subfolder"), nodeForInsertion)

            it("should insert node in leaf position") {
                assertThat(root.children, hasSize(1))
                assertThat(root.pathsToLeaves.count(), `is`(1))
                assertThat(root.toNode(), hasNodeAtPath(nodeForInsertion.toNode(), Path("folder", "subfolder", "insertedNode")))
            }
        }

        context("Inserting node in end position without ending slash") {
            val root = MutableNode("root", NodeType.Folder)
            val nodeForInsertion = MutableNode("insertedNode", NodeType.File)
            val path = Path("folder", "subfolder")
            NodeInserter.insertByPath(root, path, nodeForInsertion)

            it("should insert node in leaf position") {
                assertThat(root.children, hasSize(1))
                assertThat(root.pathsToLeaves.count(), `is`(1))
                assertThat(root.toNode(), hasNodeAtPath(nodeForInsertion.toNode(), Path("folder", "subfolder", "insertedNode")))
            }
        }
    }
})