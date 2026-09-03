package de.maibornwolff.codecharta.analysers.filters.mergefilter

import com.google.gson.JsonParser
import de.maibornwolff.codecharta.model.AttributeDescriptor
import de.maibornwolff.codecharta.model.DependencyLens
import de.maibornwolff.codecharta.model.DomainLens
import de.maibornwolff.codecharta.model.DomainNode
import de.maibornwolff.codecharta.model.DomainWord
import de.maibornwolff.codecharta.model.Edge
import de.maibornwolff.codecharta.model.LensSet
import de.maibornwolff.codecharta.model.Node
import de.maibornwolff.codecharta.model.NodeType
import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import de.maibornwolff.codecharta.serialization.ProjectSerializer
import org.junit.jupiter.api.Assertions.assertDoesNotThrow
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
    fun `should merge NFC and NFD spellings of the same file and serialize without a duplicate-id crash`() {
        // Arrange: the same file under /src spelled precomposed (NFC) in one project and decomposed (NFD)
        // in the other - a macOS filesystem walker vs a git parser. NodeId normalizes both to one id, so
        // before the fix they survived the merge as two siblings and collided at the 2.0 writer's
        // duplicate-id guard.
        val nfcName = Char(0x00C4) + "pfel.kt" // precomposed Ä + "pfel.kt"
        val nfdName = "A" + Char(0x0308) + "pfel.kt" // A + combining diaeresis + "pfel.kt"

        fun project(leafName: String, metric: String): Project {
            val leaf = Node(leafName, NodeType.File, mapOf(metric to 1.0))
            val src = Node("src", NodeType.Folder, emptyMap(), "", setOf(leaf))
            return Project("p", listOf(Node("root", NodeType.Folder, emptyMap(), "", setOf(src))), Project.API_VERSION)
        }
        val projects = listOf(project(nfcName, "a"), project(nfdName, "b"))

        // Act
        val merged = ProjectMerger(projects, nodeMergerStrategy).merge()

        // Assert: the two spellings merged into one node carrying both attributes ...
        val srcChildren = merged.rootNode.children.single().children
        assertEquals(1, srcChildren.size)
        assertTrue(srcChildren.single().attributes.containsKey("a") && srcChildren.single().attributes.containsKey("b"))
        // ... and the merged project serializes (the writer's duplicate-id guard does not fire).
        assertDoesNotThrow { ProjectSerializer.serializeToString(merged) }
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
        val clusters = JsonParser.parseString("""{"layer":"backend"}""")
        val security = JsonParser.parseString("""{"cves":2}""")
        val projectA =
            Project("a", apiVersion = "2.0", lenses = LensSet(opaqueLenses = mapOf("clusters" to clusters)), commitHash = "aaa111")
        val projectB =
            Project("b", apiVersion = "2.0", lenses = LensSet(opaqueLenses = mapOf("security" to security)), commitHash = "bbb222")

        val merged = ProjectMerger(listOf(projectA, projectB), nodeMergerStrategy).merge()

        assertTrue(merged.lenses.opaqueLenses.containsKey("clusters"))
        assertTrue(merged.lenses.opaqueLenses.containsKey("security"))
        assertEquals("aaa111", merged.commitHash)
    }

    @Test
    fun `should keep an edge descriptor without a matching edge attributeType on the dependency lens after merge`() {
        // Arrange
        val edgeDescriptor = AttributeDescriptor(title = "coupling")
        val projectWithEdgeDescriptor =
            Project(
                "a",
                apiVersion = "2.0",
                lenses =
                    LensSet(
                        dependency =
                            DependencyLens(
                                edges = listOf(Edge("/root/a", "/root/b", mapOf("coupling" to 1))),
                                attributeDescriptors = mapOf("coupling" to edgeDescriptor)
                            )
                    )
            )
        val otherProject = Project("b", apiVersion = "2.0")

        // Act
        val merged = ProjectMerger(listOf(projectWithEdgeDescriptor, otherProject), nodeMergerStrategy).merge()

        // Assert — the edge descriptor stays on the dependency lens and is not relocated to metrics.
        assertEquals("coupling", merged.lenses.dependency.attributeDescriptors["coupling"]!!.title)
        assertTrue(merged.lenses.metrics.attributeDescriptors.isEmpty())
    }

    @Test
    fun `should fail loudly when an opaque lens has conflicting payloads across inputs`() {
        val firstSecurity = JsonParser.parseString("""{"layer":"first"}""")
        val secondSecurity = JsonParser.parseString("""{"layer":"second"}""")
        val projectA = Project("a", apiVersion = "2.0", lenses = LensSet(opaqueLenses = mapOf("security" to firstSecurity)))
        val projectB = Project("b", apiVersion = "2.0", lenses = LensSet(opaqueLenses = mapOf("security" to secondSecurity)))

        assertFailsWith(MergeException::class) {
            ProjectMerger(listOf(projectA, projectB), nodeMergerStrategy).merge()
        }
    }

    @Test
    fun `should preserve a single copy of an identical opaque lens present in multiple inputs`() {
        val security = JsonParser.parseString("""{"layer":"backend"}""")
        val projectA = Project("a", apiVersion = "2.0", lenses = LensSet(opaqueLenses = mapOf("security" to security)))
        val projectB = Project("b", apiVersion = "2.0", lenses = LensSet(opaqueLenses = mapOf("security" to security)))

        val merged = ProjectMerger(listOf(projectA, projectB), nodeMergerStrategy).merge()

        assertEquals(security, merged.lenses.opaqueLenses["security"])
    }

    @Test
    fun `should let a data-bearing opaque lens win over an empty reserved slot of the same name`() {
        val emptySecurity = JsonParser.parseString("{}")
        val populatedSecurity = JsonParser.parseString("""{"layer":"backend"}""")
        val projectA = Project("a", apiVersion = "2.0", lenses = LensSet(opaqueLenses = mapOf("security" to emptySecurity)))
        val projectB = Project("b", apiVersion = "2.0", lenses = LensSet(opaqueLenses = mapOf("security" to populatedSecurity)))

        val merged = ProjectMerger(listOf(projectA, projectB), nodeMergerStrategy).merge()

        assertEquals(populatedSecurity, merged.lenses.opaqueLenses["security"])
    }

    @Test
    fun `should union the domain lenses of inputs that describe different parts of the tree`() {
        // Arrange: the shape of a monorepo scanned one subproject at a time.
        val backend = DomainLens(mapOf("backend-id" to DomainNode(listOf(DomainWord("invoice", 12)))))
        val frontend = DomainLens(mapOf("frontend-id" to DomainNode(listOf(DomainWord("checkout", 5)))))
        val projectA = Project("a", apiVersion = "2.0", lenses = LensSet(domain = backend))
        val projectB = Project("b", apiVersion = "2.0", lenses = LensSet(domain = frontend))

        // Act
        val merged = ProjectMerger(listOf(projectA, projectB), nodeMergerStrategy).merge()

        // Assert
        assertEquals(setOf("backend-id", "frontend-id"), merged.lenses.domain!!.nodes.keys)
    }

    @Test
    fun `should keep the strongest reading of a word two inputs both scored`() {
        // Arrange: two scans of the same node disagreeing on frequency and tfidf.
        val first = DomainLens(mapOf("node-id" to DomainNode(listOf(DomainWord("order", 12, 0.31)))))
        val second = DomainLens(mapOf("node-id" to DomainNode(listOf(DomainWord("order", 7, 0.44)))))
        val projectA = Project("a", apiVersion = "2.0", lenses = LensSet(domain = first))
        val projectB = Project("b", apiVersion = "2.0", lenses = LensSet(domain = second))

        // Act
        val merged = ProjectMerger(listOf(projectA, projectB), nodeMergerStrategy).merge()

        // Assert
        assertEquals(listOf(DomainWord("order", 12, 0.44)), merged.lenses.domain!!.nodes["node-id"]!!.words)
    }

    @Test
    fun `should carry the domain lens of the only input that has one into the merge`() {
        // Arrange
        val domain = DomainLens(mapOf("node-id" to DomainNode(listOf(DomainWord("order", 12, 0.42)))))
        val projectA = Project("a", apiVersion = "2.0", lenses = LensSet(domain = domain))
        val projectB = Project("b", apiVersion = "2.0")

        // Act
        val merged = ProjectMerger(listOf(projectA, projectB), nodeMergerStrategy).merge()

        // Assert
        assertEquals(domain, merged.lenses.domain)
    }

    @Test
    fun `should let a populated domain lens win over an empty reserved one`() {
        // Arrange
        val domain = DomainLens(mapOf("node-id" to DomainNode(listOf(DomainWord("order", 12)))))
        val projectA = Project("a", apiVersion = "2.0", lenses = LensSet(domain = DomainLens()))
        val projectB = Project("b", apiVersion = "2.0", lenses = LensSet(domain = domain))

        // Act
        val merged = ProjectMerger(listOf(projectA, projectB), nodeMergerStrategy).merge()

        // Assert
        assertEquals(domain, merged.lenses.domain)
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
