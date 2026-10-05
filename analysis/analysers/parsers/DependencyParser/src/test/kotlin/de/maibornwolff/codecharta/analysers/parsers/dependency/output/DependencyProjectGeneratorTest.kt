package de.maibornwolff.codecharta.analysers.parsers.dependency.output

import de.maibornwolff.codecharta.analysers.parsers.dependency.processing.Declaration
import de.maibornwolff.codecharta.analysers.parsers.dependency.processing.DeclarationAddress
import de.maibornwolff.codecharta.analysers.parsers.dependency.processing.DeclarationEdge
import de.maibornwolff.codecharta.analysers.parsers.dependency.processing.DependencyGraph
import de.maibornwolff.codecharta.analysers.parsers.dependency.processing.FileDependencyEdge
import de.maibornwolff.codecharta.analysers.parsers.dependency.processing.LevelizedNamespace
import de.maibornwolff.codecharta.analysers.parsers.dependency.processing.LevelizedPath
import de.maibornwolff.codecharta.model.AttributeType
import de.maibornwolff.codecharta.model.DependencyLeaf
import de.maibornwolff.codecharta.model.DependencyNamespace
import de.maibornwolff.codecharta.model.LeafEdge
import de.maibornwolff.codecharta.model.NodeId
import de.maibornwolff.codecharta.model.NodeType
import de.maibornwolff.codecharta.model.Project
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.entry
import org.junit.jupiter.api.Test

class DependencyProjectGeneratorTest {
    private val sourceFile = listOf("app", "Source.kt")
    private val targetFile = listOf("app", "Target.kt")
    private val analysedFiles = listOf(sourceFile, targetFile)
    private val source = DeclarationAddress(sourceFile, "Source")
    private val target = DeclarationAddress(targetFile, "Target")
    private val overload = DeclarationAddress(targetFile, "com.app.util.Target")

    private val graph =
        DependencyGraph(
            edges = listOf(FileDependencyEdge(sourceFile, targetFile, weight = 3, isCyclic = true, isPointingUpwards = true)),
            levels =
                listOf(
                    LevelizedPath(listOf("app"), isFile = false, level = 0),
                    LevelizedPath(sourceFile, isFile = true, level = 1),
                    LevelizedPath(targetFile, isFile = true, level = 0)
                ),
            declarations =
                listOf(
                    Declaration(source, "Source", "class", "kotlin", namespace = "com.app", level = 1),
                    Declaration(target, "Target", "interface", "kotlin", namespace = "com.app", level = 0),
                    Declaration(overload, "Target", "function", "kotlin")
                ),
            declarationEdges =
                listOf(
                    DeclarationEdge(
                        source,
                        target,
                        weight = 3,
                        usage = listOf("implementation"),
                        isCyclic = true,
                        isPointingUpwards = true
                    )
                ),
            namespaces = mapOf("com" to LevelizedNamespace(0), "com.app" to LevelizedNamespace(2, parent = "com"))
        )

    private val sourceFileId = NodeId.fromSegments(sourceFile, NodeType.File)
    private val targetFileId = NodeId.fromSegments(targetFile, NodeType.File)

    private fun generate(graph: DependencyGraph = this.graph): Project = DependencyProjectGenerator().generate(graph, analysedFiles)

    @Test
    fun `should build a file tree from the analysed files`() {
        // Act
        val project = generate()

        // Assert
        val appFolder = project.rootNode.children.single()
        assertThat(appFolder.name).isEqualTo("app")
        assertThat(appFolder.children.map { it.name }).containsExactlyInAnyOrder("Source.kt", "Target.kt")
    }

    @Test
    fun `should write each edge into the dependency lens with its weight and graph flags`() {
        // Act
        val project = generate()

        // Assert
        val edge = project.lenses.dependency.edges.single()
        assertThat(edge.fromNodeName).isEqualTo("/root/app/Source.kt")
        assertThat(edge.toNodeName).isEqualTo("/root/app/Target.kt")
        assertThat(edge.attributes).isEqualTo(mapOf("dependencies" to 3))
        assertThat(edge.isCyclic).isTrue()
        assertThat(edge.isPointingUpwards).isTrue()
    }

    @Test
    fun `should key each level by the node id of the file or folder it belongs to`() {
        // Act
        val project = generate()

        // Assert
        val nodes = project.lenses.dependency.nodes
        assertThat(nodes[NodeId.fromSegments(sourceFile, NodeType.File)]?.level).isEqualTo(1)
        assertThat(nodes[NodeId.fromSegments(targetFile, NodeType.File)]?.level).isEqualTo(0)
        assertThat(nodes[NodeId.fromSegments(listOf("app"), NodeType.Folder)]?.level).isEqualTo(0)
    }

    @Test
    fun `should group the declarations under the node id of the file they are declared in`() {
        // Act
        val project = generate()

        // Assert
        val leaves = project.lenses.dependency.leaves
        assertThat(leaves.keys).containsExactlyInAnyOrder(sourceFileId, targetFileId)
        assertThat(leaves.getValue(sourceFileId))
            .containsExactly(entry("Source", DependencyLeaf("class", language = "kotlin", namespace = "com.app", level = 1)))
        assertThat(leaves.getValue(targetFileId).keys).containsExactly("Target", "com.app.util.Target")
    }

    @Test
    fun `should write the name of a declaration only when it differs from its key`() {
        // Arrange
        val generator = DependencyProjectGenerator()

        // Act
        val project = generator.generate(graph, analysedFiles)

        // Assert
        val leavesOfTargetFile = project.lenses.dependency.leaves.getValue(targetFileId)
        assertThat(leavesOfTargetFile.getValue("Target").name).isNull()
        assertThat(leavesOfTargetFile.getValue("com.app.util.Target").name).isEqualTo("Target")
    }

    @Test
    fun `should write each declaration edge into the dependency lens with its endpoints, weight, usage and graph flags`() {
        // Act
        val project = generate()

        // Assert
        assertThat(project.lenses.dependency.leafEdges).containsExactly(
            LeafEdge(
                sourceFileId,
                "Source",
                targetFileId,
                "Target",
                mapOf("dependencies" to 3),
                listOf("implementation"),
                isCyclic = true,
                isPointingUpwards = true
            )
        )
    }

    @Test
    fun `should write each namespace with its level and the namespace containing it`() {
        // Act
        val project = generate()

        // Assert
        assertThat(project.lenses.dependency.namespaces).containsExactly(
            entry("com", DependencyNamespace(0)),
            entry("com.app", DependencyNamespace(2, parent = "com"))
        )
    }

    @Test
    fun `should leave the logical layer out of a project whose graph carries none`() {
        // Act
        val project = generate(DependencyGraph())

        // Assert
        assertThat(project.lenses.dependency.leaves).isEmpty()
        assertThat(project.lenses.dependency.leafEdges).isEmpty()
        assertThat(project.lenses.dependency.namespaces).isEmpty()
    }

    @Test
    fun `should count outgoing and incoming links as metrics on the file nodes`() {
        // Act
        val project = generate()

        // Assert: both count links, i.e. summed edge weights, not distinct partners.
        val appFolder = project.rootNode.children.single()
        val source = appFolder.children.single { it.name == "Source.kt" }
        val target = appFolder.children.single { it.name == "Target.kt" }
        assertThat(source.attributes).isEqualTo(mapOf("outgoing_dependencies" to 3, "incoming_dependencies" to 0))
        assertThat(target.attributes).isEqualTo(mapOf("outgoing_dependencies" to 0, "incoming_dependencies" to 3))
    }

    @Test
    fun `should define both link counts on a file that has no dependencies at all`() {
        // Act
        val project = generate(DependencyGraph())

        // Assert
        val source = project.rootNode.children
            .single()
            .children
            .single { it.name == "Source.kt" }
        assertThat(source.attributes).isEqualTo(mapOf("outgoing_dependencies" to 0, "incoming_dependencies" to 0))
    }

    @Test
    fun `should register the edge weight as an edge type and the link counts as node types`() {
        // Act
        val project = generate()

        // Assert
        assertThat(project.lenses.dependency.attributeTypes).containsEntry("dependencies", AttributeType.ABSOLUTE)
        assertThat(project.lenses.metrics.attributeTypes)
            .containsEntry("outgoing_dependencies", AttributeType.ABSOLUTE)
            .containsEntry("incoming_dependencies", AttributeType.ABSOLUTE)
    }

    @Test
    fun `should describe every attribute it emits`() {
        // Act
        val project = generate()

        // Assert
        val descriptors = project.lenses.allAttributeDescriptors()
        assertThat(descriptors.keys).contains("dependencies", "outgoing_dependencies", "incoming_dependencies")
        assertThat(descriptors.getValue("dependencies").analyzers).contains("dependencyParser")
    }

    @Test
    fun `should carry the nodes of a piped project into the result`() {
        // Arrange
        val pipedProject = DependencyProjectGenerator().generate(DependencyGraph(), listOf(listOf("legacy", "Old.kt")))

        // Act
        val project = DependencyProjectGenerator().generate(graph, analysedFiles, pipedProject)

        // Assert
        assertThat(project.rootNode.children.map { it.name }).containsExactlyInAnyOrder("app", "legacy")
    }
}
