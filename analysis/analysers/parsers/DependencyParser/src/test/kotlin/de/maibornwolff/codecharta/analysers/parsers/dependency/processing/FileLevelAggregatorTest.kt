package de.maibornwolff.codecharta.analysers.parsers.dependency.processing

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Dependency
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Node
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.NodeDependencies
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.NodeType
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class FileLevelAggregatorTest {
    private fun declaration(name: String, file: String, dependsOn: List<String> = emptyList()) = Node(
        pathWithName = Path.fromStringWithDots(name),
        physicalPath = file,
        nodeType = NodeType.CLASS,
        language = SupportedLanguage.KOTLIN,
        dependencies = emptySet(),
        usedTypes = emptySet(),
        resolvedNodeDependencies =
            NodeDependencies(
                internalDependencies = dependsOn.map { Dependency(Path.fromStringWithDots(it)) }.toSet(),
                externalDependencies = emptySet()
            )
    )

    @Test
    fun `should sum the weights of the declaration edges behind one file-to-file edge`() {
        // Arrange: two classes in one file, each depending on a class in the same other file.
        val nodes =
            listOf(
                declaration("app.First", "app/Source.kt", listOf("app.Target")),
                declaration("app.Second", "app/Source.kt", listOf("app.Target")),
                declaration("app.Target", "app/Target.kt")
            )

        // Act
        val edges = FileLevelAggregator.aggregate(nodes, emptyMap())

        // Assert
        assertThat(edges).hasSize(1)
        assertThat(edges.single().weight).isEqualTo(2)
        assertThat(edges.single().from.segments).containsExactly("app", "Source.kt")
        assertThat(edges.single().to.segments).containsExactly("app", "Target.kt")
    }

    @Test
    fun `should mark a file edge cyclic when any declaration edge behind it is cyclic`() {
        // Arrange: only the second class takes part in a cycle.
        val nodes =
            listOf(
                declaration("app.First", "app/Source.kt", listOf("app.Target")),
                declaration("app.Second", "app/Source.kt", listOf("app.Target")),
                declaration("app.Target", "app/Target.kt")
            )
        val cyclicEdges = mapOf("app.Second" to setOf("app.Target"))

        // Act
        val edges = FileLevelAggregator.aggregate(nodes, cyclicEdges)

        // Assert
        assertThat(edges.single().isCyclic).isTrue()
    }

    @Test
    fun `should leave a file edge non-cyclic when no declaration edge behind it is cyclic`() {
        // Arrange
        val nodes = listOf(declaration("app.First", "app/Source.kt", listOf("app.Target")), declaration("app.Target", "app/Target.kt"))

        // Act
        val edges = FileLevelAggregator.aggregate(nodes, mapOf("app.First" to setOf("app.Other")))

        // Assert
        assertThat(edges.single().isCyclic).isFalse()
    }

    @Test
    fun `should drop an edge between two declarations that live in the same file`() {
        // Arrange: a file cannot depend on itself.
        val nodes =
            listOf(
                declaration("app.First", "app/Source.kt", listOf("app.Second")),
                declaration("app.Second", "app/Source.kt")
            )

        // Act
        val edges = FileLevelAggregator.aggregate(nodes, emptyMap())

        // Assert
        assertThat(edges).isEmpty()
    }

    @Test
    fun `should drop a dependency on a declaration no analyzer produced`() {
        // Arrange: nothing declares app.Ghost, so there is no file for the edge to point at.
        val nodes = listOf(declaration("app.First", "app/Source.kt", listOf("app.Ghost")))

        // Act
        val edges = FileLevelAggregator.aggregate(nodes, emptyMap())

        // Assert
        assertThat(edges).isEmpty()
    }

    @Test
    fun `should keep both directions of a mutual dependency as separate edges`() {
        // Arrange
        val nodes =
            listOf(
                declaration("app.First", "app/First.kt", listOf("app.Second")),
                declaration("app.Second", "app/Second.kt", listOf("app.First"))
            )

        // Act
        val edges = FileLevelAggregator.aggregate(nodes, emptyMap())

        // Assert
        assertThat(edges).hasSize(2)
        assertThat(edges.map { it.from.segments.last() }).containsExactlyInAnyOrder("First.kt", "Second.kt")
    }

    @Test
    fun `should address a file by its path segments, with the dots inside a segment escaped for the graph`() {
        // Arrange
        val nodes = listOf(declaration("app.First", "src/app/First.kt", listOf("app.Target")), declaration("app.Target", "src/T.kt"))

        // Act
        val edge = FileLevelAggregator.aggregate(nodes, emptyMap()).single()

        // Assert: the tree keeps the real name; the graph id escapes the extension dot so its
        // dot-joined ids still split on namespace boundaries.
        assertThat(edge.from.segments).containsExactly("src", "app", "First.kt")
        assertThat(edge.from.graphId).isEqualTo("src.app.First_kt")
    }
}
