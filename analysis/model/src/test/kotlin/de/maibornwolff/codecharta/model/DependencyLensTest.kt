package de.maibornwolff.codecharta.model

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class DependencyLensTest {
    private val edgeAttributes = mapOf<String, Any>("dependencies" to 1)

    @Test
    fun `should or the graph flags of two edges sharing an endpoint pair when merging`() {
        // Arrange: two inputs found the same edge, each seeing a different property of it.
        val cyclicOnly = DependencyLens(edges = listOf(Edge("/root/a.kt", "/root/b.kt", edgeAttributes, isCyclic = true)))
        val upwardsOnly =
            DependencyLens(edges = listOf(Edge("/root/a.kt", "/root/b.kt", edgeAttributes, isPointingUpwards = true)))

        // Act
        val merged = cyclicOnly.merge(upwardsOnly)

        // Assert: an edge one input found cyclic stays cyclic, rather than losing to first-wins.
        assertThat(merged.edges).hasSize(1)
        assertThat(merged.edges.single().isCyclic).isTrue()
        assertThat(merged.edges.single().isPointingUpwards).isTrue()
    }

    @Test
    fun `should keep the higher level of a node both lenses describe when merging`() {
        // Arrange
        val shallow = DependencyLens(nodes = mapOf("node-id" to DependencyNode(1)))
        val deep = DependencyLens(nodes = mapOf("node-id" to DependencyNode(4)))

        // Act
        val merged = shallow.merge(deep)

        // Assert
        assertThat(merged.nodes["node-id"]).isEqualTo(DependencyNode(4))
    }

    @Test
    fun `should union the nodes of both lenses when merging`() {
        // Arrange: two scans that levelized different parts of the tree.
        val backend = DependencyLens(nodes = mapOf("backend-id" to DependencyNode(2)))
        val frontend = DependencyLens(nodes = mapOf("frontend-id" to DependencyNode(0)))

        // Act
        val merged = backend.merge(frontend)

        // Assert
        assertThat(merged.nodes).containsExactlyInAnyOrderEntriesOf(
            mapOf("backend-id" to DependencyNode(2), "frontend-id" to DependencyNode(0))
        )
    }

    @Test
    fun `should re-key node entries onto the paths a restructuring moved them to`() {
        // Arrange
        val fileId = NodeId.fromSegments(listOf("src", "App.kt"), NodeType.File)
        val tree =
            Node("root", NodeType.Folder, children = setOf(Node("src", NodeType.Folder, children = setOf(Node("App.kt", NodeType.File)))))
        val lens = DependencyLens(nodes = mapOf(fileId to DependencyNode(3)))

        // Act: everything moves into a new top-level folder.
        val rekeyed = lens.rekeyed(tree) { segments -> if (segments.isEmpty()) segments else listOf("alpha") + segments }

        // Assert
        assertThat(rekeyed.nodes.keys).containsExactly(NodeId.fromSegments(listOf("alpha", "src", "App.kt"), NodeType.File))
    }

    @Test
    fun `should drop a node entry for a node that the restructuring took away`() {
        // Arrange
        val fileId = NodeId.fromSegments(listOf("src", "App.kt"), NodeType.File)
        val tree =
            Node("root", NodeType.Folder, children = setOf(Node("src", NodeType.Folder, children = setOf(Node("App.kt", NodeType.File)))))
        val lens = DependencyLens(nodes = mapOf(fileId to DependencyNode(3)))

        // Act: nothing survives.
        val rekeyed = lens.rekeyed(tree) { null }

        // Assert: no key is left pointing at a node the output no longer has.
        assertThat(rekeyed.nodes).isEmpty()
    }
}
