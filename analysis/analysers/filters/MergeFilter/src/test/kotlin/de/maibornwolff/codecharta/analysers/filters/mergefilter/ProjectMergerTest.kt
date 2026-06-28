package de.maibornwolff.codecharta.analysers.filters.mergefilter

import com.google.gson.JsonParser
import de.maibornwolff.codecharta.model.AttributeDescriptor
import de.maibornwolff.codecharta.model.LensSet
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
    private val nodeMergerStrategy = MergeResolverStrategy.recursive()

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
                Project(projectName, apiVersion = "2.0"),
                Project(projectName, apiVersion = "2.0")
            )
        val project = ProjectMerger(projects, nodeMergerStrategy).merge()
        assertEquals(project.projectName, "")
    }

    @Test
    fun `should throw an exception on unsupported major versions`() {
        val projects =
            listOf(
                Project("test", apiVersion = "2.0"),
                Project("test", apiVersion = "3.0")
            )
        assertFailsWith(MergeException::class) {
            ProjectMerger(projects, nodeMergerStrategy).merge()
        }
    }

    @Test
    fun `should reject a legacy 1_x project since only 2_0 is supported`() {
        val projects =
            listOf(
                Project("test", apiVersion = "2.0"),
                Project("test", apiVersion = "1.5")
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
        // blacklist is view state dropped from the 2.0 wire, so merged inputs carry no blacklist.
        assertEquals(0, project.sizeOfBlacklist())
        assertEquals(4, project.size)
        assertEquals(2, project.lenses.legacyAttributeTypes()["edges"]!!.size)
        assertEquals(4, project.lenses.legacyAttributeTypes()["nodes"]!!.size)
        assertEquals(
            11,
            project.rootNode.children
                .first()
                .attributes.size
        )
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
        val nodeMergerStrategy: NodeMergerStrategy = MergeResolverStrategy.leaf(false)
        val project = ProjectMerger(projectList, nodeMergerStrategy).merge()

        assertNotEquals(project, originalProject1)
        assertNotEquals(project, originalProject2)
        // Overlay now unions incoming edges too (deduped), so it keeps the same 3 edges as recursive
        // instead of dropping the second project's edges.
        assertEquals(project.sizeOfEdges(), 3)
        assertEquals(project.size, 4)
        assertEquals(
            project.rootNode.children
                .first()
                .attributes.size,
            11
        )
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
                        description = "a",
                        hintLowValue = "b",
                        hintHighValue = "c",
                        link = "d",
                        direction = -1,
                        analyzers = setOf("e")
                    ),
                "merge" to
                    AttributeDescriptor(
                        description = "w",
                        hintLowValue = "x",
                        hintHighValue = "y",
                        link = "z",
                        direction = -1,
                        analyzers = setOf("Unknown", "5")
                    ),
                "somethingElse" to AttributeDescriptor(analyzers = setOf("Unknown"))
            )
        assertEquals(project.lenses.allAttributeDescriptors(), expectedResult)
    }

    @Test
    fun `should union opaque lenses across inputs and keep the first non-null commit hash`() {
        val domain = JsonParser.parseString("""{"layer":"backend"}""")
        val security = JsonParser.parseString("""{"cves":2}""")
        val projectA =
            Project("a", apiVersion = "2.0", lenses = LensSet(opaqueLenses = mapOf("domain" to domain)), commitHash = "aaa111")
        val projectB =
            Project("b", apiVersion = "2.0", lenses = LensSet(opaqueLenses = mapOf("security" to security)), commitHash = "bbb222")

        val merged = ProjectMerger(listOf(projectA, projectB), nodeMergerStrategy).merge()

        assertTrue(merged.lenses.opaqueLenses.containsKey("domain"))
        assertTrue(merged.lenses.opaqueLenses.containsKey("security"))
        assertEquals("aaa111", merged.commitHash)
    }

    @Test
    fun `should keep the first file's opaque lens on a same-name collision`() {
        val firstDomain = JsonParser.parseString("""{"layer":"first"}""")
        val secondDomain = JsonParser.parseString("""{"layer":"second"}""")
        val projectA = Project("a", apiVersion = "2.0", lenses = LensSet(opaqueLenses = mapOf("domain" to firstDomain)))
        val projectB = Project("b", apiVersion = "2.0", lenses = LensSet(opaqueLenses = mapOf("domain" to secondDomain)))

        val merged = ProjectMerger(listOf(projectA, projectB), nodeMergerStrategy).merge()

        assertEquals(firstDomain, merged.lenses.opaqueLenses["domain"])
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
