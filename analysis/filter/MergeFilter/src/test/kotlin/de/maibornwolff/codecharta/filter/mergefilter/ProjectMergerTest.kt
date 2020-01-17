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

import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.model.ProjectMatcher
import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import org.hamcrest.CoreMatchers
import org.hamcrest.MatcherAssert.assertThat
import org.spekframework.spek2.Spek
import org.spekframework.spek2.style.specification.describe
import java.io.InputStreamReader
import kotlin.test.assertFailsWith

class ProjectMergerTest: Spek({
    describe("using a recursive node merger strategy") {
        val nodeMergerStrategy = RecursiveNodeMergerStrategy()

        context("merging an project with unsupported API version") {
            val project = Project("project", apiVersion = "unsupported Version")

            it("should throw a exception") {
                assertFailsWith(MergeException::class) {
                    ProjectMerger(listOf(project), nodeMergerStrategy).merge()
                }
            }
        }

        context("merging project with same API major versions") {
            val projectName = "test"
            val projects = listOf(
                    Project(projectName, apiVersion = "1.0"),
                    Project(projectName, apiVersion = "1.1")
            )

            it("should merge projects") {
                val project = ProjectMerger(projects, nodeMergerStrategy).merge()
                assertThat(project.projectName, CoreMatchers.`is`(""))
            }
        }

        context("merging project with different API major versions") {
            val projects = listOf(
                    Project("test", apiVersion = "1.0"),
                    Project("test", apiVersion = "2.0")
            )

            it("should throw a exception") {
                assertFailsWith(MergeException::class) {
                    ProjectMerger(projects, nodeMergerStrategy).merge()
                }
            }
        }

        val TEST_JSON_FILE = "test.json"
        val TEST_JSON_FILE2 = "test2.json"

        context("merging same project") {
            val inStream = this.javaClass.classLoader.getResourceAsStream(TEST_JSON_FILE)
            val originalProject = ProjectDeserializer.deserializeProject(InputStreamReader(inStream))
            val projectList = listOf(originalProject, originalProject)

            it("should return project") {
                val project = ProjectMerger(projectList, nodeMergerStrategy).merge()
                assertThat(project, ProjectMatcher.matchesProjectUpToVersion(originalProject))
            }
        }

        context("merging two projects") {
            val originalProject1 = ProjectDeserializer.deserializeProject(
                    InputStreamReader(this.javaClass.classLoader.getResourceAsStream(TEST_JSON_FILE)))
            val originalProject2 = ProjectDeserializer.deserializeProject(
                    InputStreamReader(this.javaClass.classLoader.getResourceAsStream(TEST_JSON_FILE2)))
            val projectList = listOf(originalProject1, originalProject2)

            it("should return different project") {
                val project = ProjectMerger(projectList, nodeMergerStrategy).merge()

                assertThat(project == originalProject1, CoreMatchers.`is`(false))
                assertThat(project == originalProject2, CoreMatchers.`is`(false))
            }
        }

        val TEST_EDGES_JSON_FILE = "testEdges1.json"
        val TEST_EDGES_JSON_FILE2 = "testEdges2.json"

        context("merging two projects with edges") {
            val originalProject1 = ProjectDeserializer.deserializeProject(
                    InputStreamReader(this.javaClass.classLoader.getResourceAsStream(TEST_EDGES_JSON_FILE)))
            val originalProject2 = ProjectDeserializer.deserializeProject(
                    InputStreamReader(this.javaClass.classLoader.getResourceAsStream(TEST_EDGES_JSON_FILE2)))
            val projectList = listOf(originalProject1, originalProject2)

            val project = ProjectMerger(projectList, nodeMergerStrategy).merge()

            it("should return different project") {
                assertThat(project == originalProject1, CoreMatchers.`is`(false))
                assertThat(project == originalProject2, CoreMatchers.`is`(false))
            }

            it("should have correct number of edges") {
                assertThat(project.sizeOfEdges(), CoreMatchers.`is`(3))
            }

            it("should have correct number of blacklist items") {
                assertThat(project.sizeOfBlacklist(), CoreMatchers.`is`(4))
            }

            it("should have correct number of files") {
                assertThat(project.size, CoreMatchers.`is`(4))
            }

            it("should have correct number of attributeTypes") {
                assertThat(project.attributeTypes["edges"]!!.size, CoreMatchers.`is`(2))
                assertThat(project.attributeTypes["nodes"]!!.size, CoreMatchers.`is`(4))
            }

            it("should have correct number of attributes") {
                assertThat(project.rootNode.children.first().attributes.size, CoreMatchers.`is`(11))
            }
        }


        context("merging two projects with edges with leafNodeMergingStrategy") {
            val originalProject1 = ProjectDeserializer.deserializeProject(
                    InputStreamReader(this.javaClass.classLoader.getResourceAsStream(TEST_EDGES_JSON_FILE)))
            val originalProject2 = ProjectDeserializer.deserializeProject(
                    InputStreamReader(this.javaClass.classLoader.getResourceAsStream(TEST_EDGES_JSON_FILE2)))
            val projectList = listOf(originalProject1, originalProject2)

            val nodeMergerStrategy: NodeMergerStrategy = LeafNodeMergerStrategy(false)
            val project = ProjectMerger(projectList, nodeMergerStrategy).merge()

            it("should return different project") {

                assertThat(project == originalProject1, CoreMatchers.`is`(false))
                assertThat(project == originalProject2, CoreMatchers.`is`(false))
            }

            it("should have correct number of edges") {
                assertThat(project.sizeOfEdges(), CoreMatchers.`is`(2))
            }

            it("should have correct number of files") {
                assertThat(project.size, CoreMatchers.`is`(4))
            }

            it("should have correct number of attributes") {
                assertThat(project.rootNode.children.first().attributes.size, CoreMatchers.`is`(11))
            }
        }
    }
})
