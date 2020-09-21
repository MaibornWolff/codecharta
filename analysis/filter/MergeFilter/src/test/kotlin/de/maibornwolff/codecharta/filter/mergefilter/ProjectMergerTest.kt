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

class ProjectMergerTest : Spek({
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
                Project(projectName, apiVersion = "1.2")
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
                InputStreamReader(this.javaClass.classLoader.getResourceAsStream(TEST_JSON_FILE))
            )
            val originalProject2 = ProjectDeserializer.deserializeProject(
                InputStreamReader(this.javaClass.classLoader.getResourceAsStream(TEST_JSON_FILE2))
            )
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
                InputStreamReader(this.javaClass.classLoader.getResourceAsStream(TEST_EDGES_JSON_FILE))
            )
            val originalProject2 = ProjectDeserializer.deserializeProject(
                InputStreamReader(this.javaClass.classLoader.getResourceAsStream(TEST_EDGES_JSON_FILE2))
            )
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
                InputStreamReader(this.javaClass.classLoader.getResourceAsStream(TEST_EDGES_JSON_FILE))
            )
            val originalProject2 = ProjectDeserializer.deserializeProject(
                InputStreamReader(this.javaClass.classLoader.getResourceAsStream(TEST_EDGES_JSON_FILE2))
            )
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
