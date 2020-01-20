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

import org.hamcrest.MatcherAssert.assertThat
import org.hamcrest.Matchers
import org.hamcrest.Matchers.hasSize
import org.spekframework.spek2.Spek
import org.spekframework.spek2.style.specification.describe

class ProjectBuilderTest: Spek({

    describe("ProjectBuilder without root node") {
        val projectBuilder = ProjectBuilder()

        context("inserting new node") {
            val nodeForInsertion = MutableNode("someNode", NodeType.File)
            projectBuilder.insertByPath(Path.trivialPath(), nodeForInsertion)

            it("has node as child of root") {
                val root = projectBuilder.build().rootNode
                assertThat(root.children, hasSize(1))
                assertThat(root.children[0], NodeMatcher.matchesNode(nodeForInsertion.toNode()))
            }
        }
    }

    describe("ProjectBuilder with root node") {
        val root = MutableNode("root", NodeType.Folder)
        val projectBuilder = ProjectBuilder(listOf(root))

        context("inserting new node") {
            val nodeForInsertion = MutableNode("someNode", NodeType.File)
            projectBuilder.insertByPath(Path.trivialPath(), nodeForInsertion)

            it("creates a Project with root node") {
                val project = projectBuilder.build()
                assertThat(project.rootNode, NodeMatcher.matchesNode(root.toNode()))
                assertThat(root.children, hasSize(1))
                assertThat(root.children[0], Matchers.`is`(nodeForInsertion))
            }
        }
    }

    describe("ProjectBuilder with empty folders") {
        val projectBuilder = ProjectBuilder()
        val nodeForInsertion = MutableNode("someNode", NodeType.Folder)
        projectBuilder.insertByPath(Path.trivialPath(), nodeForInsertion)

        context("building") {
            val project = projectBuilder.build()

            it("should filter empty folders") {
                val root = project.rootNode
                assertThat(root.children, hasSize(0))
            }
        }

    }
})