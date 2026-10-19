package de.maibornwolff.codecharta.analysers.tools.analyse

import de.maibornwolff.codecharta.model.DependencyLens
import de.maibornwolff.codecharta.model.Edge
import de.maibornwolff.codecharta.model.LensSet
import de.maibornwolff.codecharta.model.Node
import de.maibornwolff.codecharta.model.NodeType
import de.maibornwolff.codecharta.model.Project
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class HistoryFilterTest {
    @Test
    fun `should drop the files and folders the code map does not have`() {
        // Arrange
        val code = projectOf(folder("src", file("App.kt")))
        val history = projectOf(folder("src", file("App.kt"), file("Deleted.kt")), folder("docs", file("logo.png")))

        // Act
        val kept = HistoryFilter.keepFilesOf(code, history)

        // Assert
        assertThat(kept.rootNode.nodes.keys.map { it.edgesList.joinToString("/") }).containsExactlyInAnyOrder("", "src", "src/App.kt")
    }

    @Test
    fun `should drop the couplings to files the code map does not have`() {
        // Arrange
        val code = projectOf(folder("src", file("App.kt"), file("Util.kt")))
        val kept = Edge("/root/src/App.kt", "/root/src/Util.kt")
        val dropped = Edge("/root/src/App.kt", "/root/src/Deleted.kt")
        val history = projectOf(folder("src", file("App.kt"), file("Util.kt"), file("Deleted.kt")), edges = listOf(kept, dropped))

        // Act
        val filtered = HistoryFilter.keepFilesOf(code, history)

        // Assert
        assertThat(filtered.lenses.dependency.edges).containsExactly(kept)
    }

    @Test
    fun `should leave an empty root when the history shares no file with the code map`() {
        // Arrange
        val code = projectOf(folder("src", file("App.kt")))
        val history = projectOf(folder("old", file("Gone.kt")))

        // Act
        val kept = HistoryFilter.keepFilesOf(code, history)

        // Assert
        assertThat(kept.rootNode.children).isEmpty()
        assertThat(kept.rootNode.type).isEqualTo(NodeType.Folder)
    }

    private fun projectOf(vararg children: Node, edges: List<Edge> = emptyList()): Project = Project(
        "test",
        listOf(Node("root", NodeType.Folder, children = children.toSet())),
        lenses = LensSet(dependency = DependencyLens(edges = edges))
    )

    private fun folder(name: String, vararg children: Node): Node = Node(name, NodeType.Folder, children = children.toSet())

    private fun file(name: String): Node = Node(name, NodeType.File, mapOf("number_of_commits" to 1))
}
