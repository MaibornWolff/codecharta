package de.maibornwolff.codecharta.analysers.filters.mergefilter

import com.google.gson.JsonParser
import de.maibornwolff.codecharta.model.DependencyLens
import de.maibornwolff.codecharta.model.DomainLens
import de.maibornwolff.codecharta.model.DomainNode
import de.maibornwolff.codecharta.model.DomainWord
import de.maibornwolff.codecharta.model.Edge
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
        val project = rootProject(lenses = LensSet(opaqueLenses = mapOf("security" to JsonParser.parseString("{}"))))

        // Act
        val wrapped = LargeMerge.wrapProjectInFolder(project, "alpha")

        // Assert
        assertEquals(JsonParser.parseString("{}"), wrapped.lenses.opaqueLenses["security"])
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
            lenses = LensSet(opaqueLenses = mapOf("security" to JsonParser.parseString("""{"nodeId":"/root/file.kt"}""")))
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
    fun `should fail loudly and name the lens when a data-bearing clusters lens cannot be re-pathed`() {
        // Arrange: the top-level clusters lens is untyped, so it rides the opaque-lens passthrough and its
        // member node ids must be protected from re-pathing by the same guard as any other opaque lens.
        val clustersLens =
            JsonParser.parseString(
                """{"clusterings":{"author-ownership":{"clusters":[{"id":"author-a","members":[{"nodeId":"a1b2c3d4e5f60718"}]}]}}}"""
            )
        val project = rootProject(lenses = LensSet(opaqueLenses = mapOf("clusters" to clustersLens)))

        // Act
        val thrown =
            assertFailsWith(IllegalArgumentException::class) {
                LargeMerge.wrapProjectInFolder(project, "alpha")
            }

        // Assert
        assertTrue(thrown.message!!.contains("clusters"))
    }
}
