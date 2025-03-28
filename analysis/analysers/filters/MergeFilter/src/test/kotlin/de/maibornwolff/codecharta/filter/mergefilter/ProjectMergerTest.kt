package de.maibornwolff.codecharta.analysers.filters.mergefilter

import de.maibornwolff.codecharta.model.AttributeDescriptor
import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import java.io.InputStreamReader
import kotlin.test.assertFailsWith

const val TEST_JSON_FILE = "test.json"

class ProjectMergerTest {
    private val nodeMergerStrategy = RecursiveNodeMergerStrategy()

    @Test
    fun `should throw an exception for unsupported api version`() {
        val project = Project("project", apiVersion = "unsupported Version")
        assertFailsWith(MergeException::class) {
            ProjectMerger(listOf(project), nodeMergerStrategy).merge()
        }
    }

    @Test
    fun `should be able to merge identical major api versions`() {
        val projectName = "test"
        val projects =
            listOf(
                Project(projectName, apiVersion = "1.0"),
                Project(projectName, apiVersion = "1.2")
            )
        val project = ProjectMerger(projects, nodeMergerStrategy).merge()
        assertEquals(project.projectName, "")
    }

    @Test
    fun `should throw an exception on major version differences`() {
        val projects =
            listOf(
                Project("test", apiVersion = "1.0"),
                Project("test", apiVersion = "2.0")
            )
        assertFailsWith(MergeException::class) {
            ProjectMerger(projects, nodeMergerStrategy).merge()
        }
    }

    @Test
    fun `should return a merged project when merging with itself`() {
        val inStream = this.javaClass.classLoader.getResourceAsStream(TEST_JSON_FILE)
        val originalProject = ProjectDeserializer.deserializeProject(InputStreamReader(inStream!!))
        val projectList = listOf(originalProject, originalProject)
        val project = ProjectMerger(projectList, nodeMergerStrategy).merge()
        assertTrue(compareProjectStrings(project, originalProject, listOf("projectName", "apiVersion")))
    }

    @Test
    fun `should merge two projects`() {
        val originalProject1 =
            ProjectDeserializer.deserializeProject(
                InputStreamReader(this.javaClass.classLoader.getResourceAsStream(TEST_JSON_FILE)!!)
            )
        val originalProject2 =
            ProjectDeserializer.deserializeProject(
                InputStreamReader(this.javaClass.classLoader.getResourceAsStream(TEST_JSON_FILE2)!!)
            )
        val projectList = listOf(originalProject1, originalProject2)
        val project = ProjectMerger(projectList, nodeMergerStrategy).merge()
        assertNotEquals(project, originalProject1)
        assertNotEquals(project, originalProject2)
    }

    @Test
    fun `should merge project with edges`() {
        val originalProject1 =
            ProjectDeserializer.deserializeProject(
                InputStreamReader(
                    this.javaClass.classLoader.getResourceAsStream(TEST_EDGES_JSON_FILE)!!
                )
            )
        val originalProject2 =
            ProjectDeserializer.deserializeProject(
                InputStreamReader(
                    this.javaClass.classLoader.getResourceAsStream(TEST_EDGES_JSON_FILE2)!!
                )
            )
        val projectList = listOf(originalProject1, originalProject2)
        val project = ProjectMerger(projectList, nodeMergerStrategy).merge()

        assertNotEquals(originalProject1, project)
        assertNotEquals(originalProject2, project)
        assertEquals(3, project.sizeOfEdges())
        assertEquals(4, project.sizeOfBlacklist())
        assertEquals(4, project.size)
        assertEquals(2, project.attributeTypes["edges"]!!.size)
        assertEquals(4, project.attributeTypes["nodes"]!!.size)
        assertEquals(11, project.rootNode.children.first().attributes.size)
    }

    @Test
    fun `should merge two projects with edges with leafNodeMergingStrategy`() {
        val originalProject1 =
            ProjectDeserializer.deserializeProject(
                InputStreamReader(
                    this.javaClass.classLoader.getResourceAsStream(TEST_EDGES_JSON_FILE)!!
                )
            )
        val originalProject2 =
            ProjectDeserializer.deserializeProject(
                InputStreamReader(
                    this.javaClass.classLoader.getResourceAsStream(TEST_EDGES_JSON_FILE2)!!
                )
            )
        val projectList = listOf(originalProject1, originalProject2)
        val nodeMergerStrategy: NodeMergerStrategy = LeafNodeMergerStrategy(false)
        val project = ProjectMerger(projectList, nodeMergerStrategy).merge()

        assertNotEquals(project, originalProject1)
        assertNotEquals(project, originalProject2)
        assertEquals(project.sizeOfEdges(), 2)
        assertEquals(project.size, 4)
        assertEquals(project.rootNode.children.first().attributes.size, 11)
    }

    @Test
    fun `should contain all three attributeDescriptors after merge`() {
        val originalProject1 =
            ProjectDeserializer.deserializeProject(
                InputStreamReader(this.javaClass.classLoader.getResourceAsStream(TEST_DESC_FILE)!!)
            )
        val originalProject2 =
            ProjectDeserializer.deserializeProject(
                InputStreamReader(this.javaClass.classLoader.getResourceAsStream(TEST_DESC_FILE2)!!)
            )
        val projectList = listOf(originalProject1, originalProject2)
        val project = ProjectMerger(projectList, nodeMergerStrategy).merge()
        val expectedResult =
            mapOf<String, AttributeDescriptor>(
                "single" to
                    AttributeDescriptor(
                        description = "a", hintLowValue = "b", hintHighValue = "c",
                        link = "d", direction = -1
                    ),
                "merge" to
                    AttributeDescriptor(
                        description = "1", hintLowValue = "2", hintHighValue = "3",
                        link = "4", direction = -1
                    ),
                "somethingElse" to AttributeDescriptor()
            )
        assertEquals(project.attributeDescriptors, expectedResult)
    }

    private fun compareProjectStrings(project: Project, equalProject: Project, except: List<String> = listOf()): Boolean {
        var projectString = project.toString()
        var equalProjectString = equalProject.toString()
        except.forEach {
            projectString = projectString.replaceFirst("$it=.*?, ".toRegex(), "")
            equalProjectString = equalProjectString.replaceFirst("$it=.*?, ".toRegex(), "")
        }
        return projectString == equalProjectString
    }

    companion object {
        private const val TEST_JSON_FILE2 = "test2.json"
        private const val TEST_EDGES_JSON_FILE = "testEdges1.json"
        private const val TEST_EDGES_JSON_FILE2 = "testEdges2.json"
        private const val TEST_DESC_FILE = "descriptorTest1.json"
        private const val TEST_DESC_FILE2 = "descriptorTest2.json"
    }
}
