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
    fun `should keep the higher level of a namespace both lenses describe when merging`() {
        // Arrange
        val shallow = DependencyLens(namespaces = mapOf("com.example" to DependencyNamespace(1)))
        val deep = DependencyLens(namespaces = mapOf("com.example" to DependencyNamespace(4)))

        // Act
        val merged = shallow.merge(deep)

        // Assert
        assertThat(merged.namespaces["com.example"]).isEqualTo(DependencyNamespace(4))
    }

    @Test
    fun `should keep the first description of a leaf both lenses declare when merging`() {
        // Arrange: two scans resolved the same dotted path to declarations in different files.
        val first = DependencyLens(leaves = mapOf("com.example.Creature" to DependencyLeaf("node-a", "Creature", "CLASS", 2)))
        val second = DependencyLens(leaves = mapOf("com.example.Creature" to DependencyLeaf("node-b", "Creature", "INTERFACE", 0)))

        // Act
        val merged = first.merge(second)

        // Assert
        assertThat(merged.leaves["com.example.Creature"]).isEqualTo(DependencyLeaf("node-a", "Creature", "CLASS", 2))
    }

    @Test
    fun `should fold leaf edges sharing an endpoint pair by summing weights and unioning usage`() {
        // Arrange: the same declaration pair, seen once as inheritance and once as an argument.
        val inheritance =
            DependencyLens(
                leafEdges =
                    listOf(LeafEdge("com.example.A", "com.example.B", mapOf("dependencies" to 2), listOf("inheritance"), isCyclic = true))
            )
        val argument =
            DependencyLens(
                leafEdges =
                    listOf(
                        LeafEdge("com.example.A", "com.example.B", mapOf("dependencies" to 1), listOf("argument"), isPointingUpwards = true)
                    )
            )

        // Act
        val merged = inheritance.merge(argument)

        // Assert
        val leafEdge = merged.leafEdges.single()
        assertThat(leafEdge.attributes).isEqualTo(mapOf("dependencies" to 3L))
        assertThat(leafEdge.usage).containsExactly("inheritance", "argument")
        assertThat(leafEdge.isCyclic).isTrue()
        assertThat(leafEdge.isPointingUpwards).isTrue()
    }

    @Test
    fun `should re-point a leaf at the file the restructuring moved it to while keeping its logical key`() {
        // Arrange
        val fileId = NodeId.fromSegments(listOf("src", "App.kt"), NodeType.File)
        val tree =
            Node("root", NodeType.Folder, children = setOf(Node("src", NodeType.Folder, children = setOf(Node("App.kt", NodeType.File)))))
        val lens = DependencyLens(leaves = mapOf("com.example.App" to DependencyLeaf(fileId, "App", "CLASS", 1)))

        // Act
        val rekeyed = lens.rekeyed(tree) { segments -> if (segments.isEmpty()) segments else listOf("alpha") + segments }

        // Assert: the package did not move, the file did.
        assertThat(rekeyed.leaves.keys).containsExactly("com.example.App")
        assertThat(rekeyed.leaves.getValue("com.example.App").nodeId)
            .isEqualTo(NodeId.fromSegments(listOf("alpha", "src", "App.kt"), NodeType.File))
    }

    @Test
    fun `should drop a leaf and its edges when the restructuring took its file away`() {
        // Arrange
        val fileId = NodeId.fromSegments(listOf("src", "App.kt"), NodeType.File)
        val tree =
            Node("root", NodeType.Folder, children = setOf(Node("src", NodeType.Folder, children = setOf(Node("App.kt", NodeType.File)))))
        val lens =
            DependencyLens(
                leaves = mapOf("com.example.App" to DependencyLeaf(fileId, "App", "CLASS", 1)),
                leafEdges = listOf(LeafEdge("com.example.App", "com.example.Lib"))
            )

        // Act: nothing survives.
        val rekeyed = lens.rekeyed(tree) { null }

        // Assert: no leaf and no leaf edge is left pointing at something the output no longer has.
        assertThat(rekeyed.leaves).isEmpty()
        assertThat(rekeyed.leafEdges).isEmpty()
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
