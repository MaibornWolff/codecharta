package de.maibornwolff.codecharta.model

import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.entry
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
        val rekeyed = lens.rekeyed(tree, movedInto("alpha", tree)) { segments ->
            if (segments.isEmpty()) {
                segments
            } else {
                listOf("alpha") +
                    segments
            }
        }

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
    fun `should keep the parent of a namespace only one of the lenses knows when merging`() {
        // Arrange
        val withoutParent = DependencyLens(namespaces = mapOf("com.example" to DependencyNamespace(1)))
        val withParent = DependencyLens(namespaces = mapOf("com.example" to DependencyNamespace(0, parent = "com")))

        // Act
        val merged = withoutParent.merge(withParent)

        // Assert
        assertThat(merged.namespaces["com.example"]).isEqualTo(DependencyNamespace(1, parent = "com"))
    }

    @Test
    fun `should keep the leaves of one name apart when two files declare it`() {
        // Arrange: a partial class, one part per file and per scan.
        val first = DependencyLens(leaves = mapOf("node-a" to mapOf("Creature" to DependencyLeaf("class", namespace = "com.example"))))
        val second = DependencyLens(leaves = mapOf("node-b" to mapOf("Creature" to DependencyLeaf("class", namespace = "com.example"))))

        // Act
        val merged = first.merge(second)

        // Assert
        assertThat(merged.leaves.keys).containsExactly("node-a", "node-b")
    }

    @Test
    fun `should union the leaves two lenses declare in one file when merging`() {
        // Arrange
        val first = DependencyLens(leaves = mapOf("node-a" to mapOf("Creature" to DependencyLeaf("class"))))
        val second = DependencyLens(leaves = mapOf("node-a" to mapOf("Dragon" to DependencyLeaf("class"))))

        // Act
        val merged = first.merge(second)

        // Assert
        assertThat(merged.leaves.getValue("node-a").keys).containsExactly("Creature", "Dragon")
    }

    @Test
    fun `should keep the first description of a leaf both lenses describe differently when merging`() {
        // Arrange
        val first = DependencyLens(leaves = mapOf("node-a" to mapOf("Creature" to DependencyLeaf("class", level = 2))))
        val second = DependencyLens(leaves = mapOf("node-a" to mapOf("Creature" to DependencyLeaf("interface", level = 0))))

        // Act
        val merged = first.merge(second)

        // Assert
        assertThat(merged.leaves.getValue("node-a")).containsExactly(entry("Creature", DependencyLeaf("class", level = 2)))
    }

    @Test
    fun `should fold leaf edges sharing both endpoints by keeping the first weight and unioning usage`() {
        // Arrange: the same declaration pair, seen once as inheritance and once as an argument.
        val inheritance =
            DependencyLens(
                leafEdges = listOf(LeafEdge("a", "A", "b", "B", mapOf("dependencies" to 2), listOf("inheritance"), isCyclic = true))
            )
        val argument =
            DependencyLens(
                leafEdges = listOf(LeafEdge("a", "A", "b", "B", mapOf("dependencies" to 1), listOf("argument"), isPointingUpwards = true))
            )

        // Act
        val merged = inheritance.merge(argument)

        // Assert
        val leafEdge = merged.leafEdges.single()
        assertThat(leafEdge.attributes).isEqualTo(mapOf("dependencies" to 2))
        assertThat(leafEdge.usage).containsExactly("inheritance", "argument")
        assertThat(leafEdge.isCyclic).isTrue()
        assertThat(leafEdge.isPointingUpwards).isTrue()
    }

    @Test
    fun `should keep leaf edges apart whose leaves share a key but sit in different files`() {
        // Arrange
        val first = DependencyLens(leafEdges = listOf(LeafEdge("a", "A", "b", "B")))
        val second = DependencyLens(leafEdges = listOf(LeafEdge("a", "A", "c", "B")))

        // Act
        val merged = first.merge(second)

        // Assert
        assertThat(merged.leafEdges).hasSize(2)
    }

    @Test
    fun `should re-key the leaves and leaf edges of a file onto the path a restructuring moved it to`() {
        // Arrange
        val fileId = NodeId.fromSegments(listOf("src", "App.kt"), NodeType.File)
        val movedId = NodeId.fromSegments(listOf("alpha", "src", "App.kt"), NodeType.File)
        val tree =
            Node("root", NodeType.Folder, children = setOf(Node("src", NodeType.Folder, children = setOf(Node("App.kt", NodeType.File)))))
        val leavesOfFile = mapOf("App" to DependencyLeaf("class"), "Helper" to DependencyLeaf("class"))
        val lens = DependencyLens(leaves = mapOf(fileId to leavesOfFile), leafEdges = listOf(LeafEdge(fileId, "App", fileId, "Helper")))

        // Act
        val rekeyed = lens.rekeyed(tree, movedInto("alpha", tree)) { segments ->
            if (segments.isEmpty()) {
                segments
            } else {
                listOf("alpha") +
                    segments
            }
        }

        // Assert
        assertThat(rekeyed.leaves).containsExactly(entry(movedId, leavesOfFile))
        assertThat(rekeyed.leafEdges).containsExactly(LeafEdge(movedId, "App", movedId, "Helper"))
    }

    @Test
    fun `should keep the part of a split declaration whose file survived the restructuring`() {
        // Arrange: a partial class declared in two files, one of which does not survive.
        val appId = NodeId.fromSegments(listOf("src", "App.cs"), NodeType.File)
        val generatedId = NodeId.fromSegments(listOf("gen", "App.g.cs"), NodeType.File)
        val tree = treeOf("src" to "App.cs", "gen" to "App.g.cs")
        val part = mapOf("App" to DependencyLeaf("class"))
        val lens = DependencyLens(leaves = mapOf(appId to part, generatedId to part))

        // Act
        val rekeyed = lens.rekeyed(tree, without("gen", tree)) { segments -> if (segments.firstOrNull() == "gen") null else segments }

        // Assert
        assertThat(rekeyed.leaves.keys).containsExactly(appId)
    }

    @Test
    fun `should drop the leaves of a file the restructuring took away and the leaf edges touching them`() {
        // Arrange
        val appId = NodeId.fromSegments(listOf("src", "App.kt"), NodeType.File)
        val libId = NodeId.fromSegments(listOf("lib", "Lib.kt"), NodeType.File)
        val tree = treeOf("src" to "App.kt", "lib" to "Lib.kt")
        val lens =
            DependencyLens(
                leaves = mapOf(appId to mapOf("App" to DependencyLeaf("class")), libId to mapOf("Lib" to DependencyLeaf("class"))),
                leafEdges = listOf(LeafEdge(appId, "App", libId, "Lib"))
            )

        // Act
        val rekeyed = lens.rekeyed(tree, without("lib", tree)) { segments -> if (segments.firstOrNull() == "lib") null else segments }

        // Assert
        assertThat(rekeyed.leaves.keys).containsExactly(appId)
        assertThat(rekeyed.leafEdges).isEmpty()
    }

    @Test
    fun `should drop the leaves of a file that a move discarded for the file already at its destination`() {
        // Arrange: `moved/Shared.kt` lands on `kept/Shared.kt`, which stays; the tree discards the moved one.
        val discardedId = NodeId.fromSegments(listOf("moved", "Shared.kt"), NodeType.File)
        val keptId = NodeId.fromSegments(listOf("kept", "Shared.kt"), NodeType.File)
        val userId = NodeId.fromSegments(listOf("app", "User.kt"), NodeType.File)
        val tree = treeOf("moved" to "Shared.kt", "kept" to "Shared.kt", "app" to "User.kt")
        val lens =
            DependencyLens(
                leaves =
                    mapOf(
                        discardedId to mapOf("Discarded" to DependencyLeaf("class")),
                        keptId to mapOf("Kept" to DependencyLeaf("class")),
                        userId to mapOf("User" to DependencyLeaf("class"))
                    ),
                leafEdges = listOf(LeafEdge(userId, "User", discardedId, "Discarded"), LeafEdge(userId, "User", keptId, "Kept"))
            )

        // Act
        val rekeyed =
            lens.rekeyed(tree, without("moved", tree)) { segments ->
                if (segments.firstOrNull() == "moved") listOf("kept") + segments.drop(1) else segments
            }

        // Assert
        assertThat(rekeyed.leaves).containsOnly(
            entry(keptId, mapOf("Kept" to DependencyLeaf("class"))),
            entry(userId, mapOf("User" to DependencyLeaf("class")))
        )
        assertThat(rekeyed.leafEdges).containsExactly(LeafEdge(userId, "User", keptId, "Kept"))
    }

    @Test
    fun `should re-key leaf edges of a lens that carries no leaves`() {
        // Arrange
        val appId = NodeId.fromSegments(listOf("src", "App.kt"), NodeType.File)
        val libId = NodeId.fromSegments(listOf("lib", "Lib.kt"), NodeType.File)
        val tree = treeOf("src" to "App.kt", "lib" to "Lib.kt")
        val lens = DependencyLens(leafEdges = listOf(LeafEdge(appId, "App", appId, "Helper"), LeafEdge(appId, "App", libId, "Lib")))

        // Act
        val rekeyed = lens.rekeyed(tree, without("lib", tree)) { segments -> if (segments.firstOrNull() == "lib") null else segments }

        // Assert
        assertThat(rekeyed.leafEdges).containsExactly(LeafEdge(appId, "App", appId, "Helper"))
    }

    @Test
    fun `should drop a namespace no surviving leaf lives in while keeping the parents of the survivors`() {
        // Arrange: two packages, one of which loses its only file. The keys share no dots with their parents.
        val appId = NodeId.fromSegments(listOf("src", "App.kt"), NodeType.File)
        val libId = NodeId.fromSegments(listOf("lib", "Lib.kt"), NodeType.File)
        val tree = treeOf("src" to "App.kt", "lib" to "Lib.kt")
        val lens =
            DependencyLens(
                namespaces =
                    mapOf(
                        "acme" to DependencyNamespace(0),
                        "application" to DependencyNamespace(1, parent = "acme"),
                        "library" to DependencyNamespace(0, parent = "acme"),
                        "acme.unused" to DependencyNamespace(0)
                    ),
                leaves =
                    mapOf(
                        appId to mapOf("App" to DependencyLeaf("class", namespace = "application")),
                        libId to mapOf("Lib" to DependencyLeaf("class", namespace = "library"))
                    )
            )

        // Act: only the `src` subtree survives.
        val rekeyed = lens.rekeyed(tree, without("lib", tree)) { segments -> if (segments.firstOrNull() == "lib") null else segments }

        // Assert
        assertThat(rekeyed.namespaces.keys).containsExactly("acme", "application")
    }

    @Test
    fun `should drop a node entry for a node that the restructuring took away`() {
        // Arrange
        val fileId = NodeId.fromSegments(listOf("src", "App.kt"), NodeType.File)
        val tree =
            Node("root", NodeType.Folder, children = setOf(Node("src", NodeType.Folder, children = setOf(Node("App.kt", NodeType.File)))))
        val lens = DependencyLens(nodes = mapOf(fileId to DependencyNode(3)))

        // Act: nothing survives.
        val rekeyed = lens.rekeyed(tree, Node("root", NodeType.Folder)) { null }

        // Assert: no key is left pointing at a node the output no longer has.
        assertThat(rekeyed.nodes).isEmpty()
    }

    @Test
    fun `should drop a node entry for a folder the restructuring emptied and pruned`() {
        // Arrange: the file moves out of src, so src is left empty and the tree no longer has it.
        val folderId = NodeId.fromSegments(listOf("src"), NodeType.Folder)
        val fileId = NodeId.fromSegments(listOf("src", "App.kt"), NodeType.File)
        val treeBefore =
            Node("root", NodeType.Folder, children = setOf(Node("src", NodeType.Folder, children = setOf(Node("App.kt", NodeType.File)))))
        val treeAfter = Node("root", NodeType.Folder, children = setOf(Node("App.kt", NodeType.File)))
        val lens = DependencyLens(nodes = mapOf(folderId to DependencyNode(0), fileId to DependencyNode(2)))

        // Act: only the file moves; the folder's own path is unchanged.
        val rekeyed = lens.rekeyed(treeBefore, treeAfter) { segments ->
            if (segments ==
                listOf("src", "App.kt")
            ) {
                listOf("App.kt")
            } else {
                segments
            }
        }

        // Assert: no key is left pointing at the pruned folder.
        assertThat(rekeyed.nodes.keys).containsExactly(NodeId.fromSegments(listOf("App.kt"), NodeType.File))
    }

    private fun movedInto(folderName: String, tree: Node): Node =
        Node(tree.name, NodeType.Folder, children = setOf(Node(folderName, NodeType.Folder, children = tree.children)))

    private fun without(childName: String, tree: Node): Node =
        Node(tree.name, NodeType.Folder, children = tree.children.filterNot { it.name == childName }.toSet())

    private fun treeOf(vararg filesByFolder: Pair<String, String>): Node = Node(
        "root",
        NodeType.Folder,
        children = filesByFolder
            .map { (folder, file) ->
                Node(folder, NodeType.Folder, children = setOf(Node(file, NodeType.File)))
            }.toSet()
    )

    @Test
    fun `should prefix the namespace keys and every reference to them when a project is wrapped`() {
        // Arrange
        val lens = DependencyLens(
            namespaces = mapOf("com" to DependencyNamespace(0), "com.example" to DependencyNamespace(0, parent = "com")),
            leaves = mapOf("id" to mapOf("App" to DependencyLeaf("class", namespace = "com.example", parent = "Outer"))),
            leafEdges = listOf(LeafEdge("id", "App", "id", "Lib"))
        )

        // Act
        val wrapped = lens.underNamespace("backend")

        // Assert: leaf keys and leaf edges address files, so only the namespaces move.
        assertThat(wrapped.namespaces).containsExactly(
            entry("backend.com", DependencyNamespace(0)),
            entry("backend.com.example", DependencyNamespace(0, parent = "backend.com"))
        )
        assertThat(wrapped.leaves).containsExactly(
            entry("id", mapOf("App" to DependencyLeaf("class", namespace = "backend.com.example", parent = "Outer")))
        )
        assertThat(wrapped.leafEdges).isEqualTo(lens.leafEdges)
    }
}
