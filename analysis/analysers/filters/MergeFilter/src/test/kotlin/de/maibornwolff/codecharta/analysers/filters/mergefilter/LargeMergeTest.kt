package de.maibornwolff.codecharta.analysers.filters.mergefilter

import com.google.gson.JsonParser
import de.maibornwolff.codecharta.model.Cluster
import de.maibornwolff.codecharta.model.ClusterMember
import de.maibornwolff.codecharta.model.ClusterMembership
import de.maibornwolff.codecharta.model.Clustering
import de.maibornwolff.codecharta.model.ClustersLens
import de.maibornwolff.codecharta.model.DependencyLeaf
import de.maibornwolff.codecharta.model.DependencyLens
import de.maibornwolff.codecharta.model.DependencyNamespace
import de.maibornwolff.codecharta.model.DomainLens
import de.maibornwolff.codecharta.model.DomainNode
import de.maibornwolff.codecharta.model.DomainWord
import de.maibornwolff.codecharta.model.Edge
import de.maibornwolff.codecharta.model.LeafEdge
import de.maibornwolff.codecharta.model.LensSet
import de.maibornwolff.codecharta.model.Node
import de.maibornwolff.codecharta.model.NodeId
import de.maibornwolff.codecharta.model.NodeType
import de.maibornwolff.codecharta.model.Project
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import kotlin.test.assertFailsWith

class LargeMergeTest {
    private fun rootProject(lenses: LensSet = LensSet()): Project = Project(
        projectName = "p",
        nodes = listOf(
            Node("root", NodeType.Folder, children = setOf(Node("file.kt", NodeType.File, attributes = mapOf("rloc" to 1))))
        ),
        apiVersion = "2.0",
        lenses = lenses
    )

    @Test
    fun `should move the namespaces under the folder and re-key the leaves onto the wrapped file`() {
        // Arrange
        val fileId = NodeId.fromSegments(listOf("file.kt"), NodeType.File)
        val project = rootProject(
            lenses = LensSet(
                dependency = DependencyLens(
                    namespaces = mapOf("com.example" to DependencyNamespace(0)),
                    leaves = mapOf(fileId to mapOf("File" to DependencyLeaf("class", namespace = "com.example", level = 1))),
                    leafEdges = listOf(LeafEdge(fileId, "File", fileId, "File"))
                )
            )
        )

        // Act
        val wrapped = LargeMerge.wrapProjectInFolder(project, "alpha")

        // Assert: the package and the file both moved into the folder, so a second project declaring
        // com.example stays apart from this one.
        val wrappedFileId = NodeId.fromSegments(listOf("alpha", "file.kt"), NodeType.File)
        val dependency = wrapped.lenses.dependency
        assertEquals(mapOf("alpha.com.example" to DependencyNamespace(0)), dependency.namespaces)
        assertEquals(
            mapOf(wrappedFileId to mapOf("File" to DependencyLeaf("class", namespace = "alpha.com.example", level = 1))),
            dependency.leaves
        )
        assertEquals(listOf(LeafEdge(wrappedFileId, "File", wrappedFileId, "File")), dependency.leafEdges)
    }

    @Test
    fun `should wrap nodes under the prefix folder and re-path edges while keeping node attributes`() {
        // Arrange
        val project = rootProject(
            lenses = LensSet(dependency = DependencyLens(edges = listOf(Edge("/root/file.kt", "/root/file.kt"))))
        )

        // Act
        val wrapped = LargeMerge.wrapProjectInFolder(project, "alpha")

        // Assert
        val folder = wrapped.rootNode.children.single()
        assertEquals("alpha", folder.name)
        assertEquals(mapOf("rloc" to 1), folder.children.single().attributes)
        assertEquals(
            "/root/alpha/file.kt",
            wrapped.lenses.dependency.edges
                .single()
                .fromNodeName
        )
    }

    @Test
    fun `should preserve empty reserved opaque slots when wrapping`() {
        // Arrange
        val project = rootProject(lenses = LensSet(opaqueLenses = mapOf("vendorFindings" to JsonParser.parseString("{}"))))

        // Act
        val wrapped = LargeMerge.wrapProjectInFolder(project, "alpha")

        // Assert
        assertEquals(JsonParser.parseString("{}"), wrapped.lenses.opaqueLenses["vendorFindings"])
    }

    @Test
    fun `should preserve an empty reserved domain lens when wrapping`() {
        // Arrange
        val project = rootProject(lenses = LensSet(domain = DomainLens()))

        // Act
        val wrapped = LargeMerge.wrapProjectInFolder(project, "alpha")

        // Assert
        assertEquals(DomainLens(), wrapped.lenses.domain)
    }

    @Test
    fun `should fail loudly when a data-bearing opaque lens cannot be re-pathed`() {
        // Arrange
        val project = rootProject(
            lenses = LensSet(opaqueLenses = mapOf("vendorFindings" to JsonParser.parseString("""{"nodeId":"/root/file.kt"}""")))
        )

        // Act & Assert
        assertFailsWith(IllegalArgumentException::class) {
            LargeMerge.wrapProjectInFolder(project, "alpha")
        }
    }

    @Test
    fun `should re-key a populated domain lens onto the wrapped paths`() {
        // Arrange: words on the file that wrapping is about to move to /root/alpha/file.kt.
        val words = listOf(DomainWord("order", 4))
        val fileId = NodeId.fromSegments(listOf("file.kt"), NodeType.File)
        val project = rootProject(lenses = LensSet(domain = DomainLens(mapOf(fileId to DomainNode(words)))))

        // Act
        val wrapped = LargeMerge.wrapProjectInFolder(project, "alpha")

        // Assert: the words follow the file rather than being refused or orphaned.
        val wrappedFileId = NodeId.fromSegments(listOf("alpha", "file.kt"), NodeType.File)
        assertEquals(words, wrapped.lenses.domain!!.nodes[wrappedFileId]!!.words)
    }

    @Test
    fun `should keep the root entry of a domain lens when wrapping`() {
        // Arrange: the root aggregate still covers everything below it after wrapping.
        val rootId = NodeId.fromSegments(emptyList(), NodeType.Folder)
        val project = rootProject(lenses = LensSet(domain = DomainLens(mapOf(rootId to DomainNode(listOf(DomainWord("order", 4)))))))

        // Act
        val wrapped = LargeMerge.wrapProjectInFolder(project, "alpha")

        // Assert
        assertEquals(setOf(rootId), wrapped.lenses.domain!!.nodes.keys)
    }

    @Test
    fun `should re-key the cluster members onto the wrapped file`() {
        // Arrange
        val clusters = ClustersLens(
            mapOf(
                "author-ownership" to Clustering(
                    "Author ownership",
                    ClusterMembership.WEIGHTED,
                    listOf("gitlogparser"),
                    listOf(Cluster("abc-author-1", "Author 1", listOf(ClusterMember(NodeId.fromSegments(listOf("file.kt")), 0.5))))
                )
            )
        )
        val project = rootProject(lenses = LensSet(clusters = clusters))

        // Act
        val wrapped = LargeMerge.wrapProjectInFolder(project, "alpha")

        // Assert
        val member = wrapped.lenses.clusters.clusterings
            .getValue("author-ownership")
            .clusters
            .single()
            .members
            .single()
        assertEquals(ClusterMember(NodeId.fromSegments(listOf("alpha", "file.kt")), 0.5), member)
    }

    @Test
    fun `should fail loudly and name the lens when a data-bearing opaque lens cannot be re-pathed`() {
        // Arrange
        val customLens = JsonParser.parseString("""{"members":[{"nodeId":"a1b2c3d4e5f60718"}]}""")
        val project = rootProject(lenses = LensSet(opaqueLenses = mapOf("custom" to customLens)))

        // Act
        val thrown =
            assertFailsWith(IllegalArgumentException::class) {
                LargeMerge.wrapProjectInFolder(project, "alpha")
            }

        // Assert
        assertTrue(thrown.message!!.contains("custom"))
    }
}
