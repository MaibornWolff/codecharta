package de.maibornwolff.codecharta.model

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class DomainLensTest {
    @Test
    fun `should union the nodes of both lenses when merging`() {
        // Arrange: two scans that describe different parts of the tree.
        val backend = DomainLens(mapOf("backend-id" to DomainNode(listOf(DomainWord("invoice", 12)))))
        val frontend = DomainLens(mapOf("frontend-id" to DomainNode(listOf(DomainWord("checkout", 5)))))

        // Act
        val merged = backend.merge(frontend)

        // Assert
        assertThat(merged.nodes.keys).containsExactlyInAnyOrder("backend-id", "frontend-id")
        assertThat(merged.nodes["frontend-id"]!!.words).containsExactly(DomainWord("checkout", 5))
    }

    @Test
    fun `should keep the higher frequency and the higher tfidf of a word both inputs carry`() {
        // Arrange: the same word on the same node, each input strongest on a different measure.
        val first = DomainLens(mapOf("node-id" to DomainNode(listOf(DomainWord("order", 12, 0.31)))))
        val second = DomainLens(mapOf("node-id" to DomainNode(listOf(DomainWord("order", 7, 0.44)))))

        // Act
        val merged = first.merge(second)

        // Assert: both measures win independently, as metrics do when maps are merged.
        assertThat(merged.nodes["node-id"]!!.words).containsExactly(DomainWord("order", 12, 0.44))
    }

    @Test
    fun `should keep a score for a word that only one input scored`() {
        // Arrange: one input ran without tfidf.
        val scored = DomainLens(mapOf("node-id" to DomainNode(listOf(DomainWord("order", 3, 0.5)))))
        val unscored = DomainLens(mapOf("node-id" to DomainNode(listOf(DomainWord("order", 9)))))

        // Act
        val merged = scored.merge(unscored)

        // Assert
        assertThat(merged.nodes["node-id"]!!.words).containsExactly(DomainWord("order", 9, 0.5))
    }

    @Test
    fun `should order the words of a merged node by frequency and then alphabetically`() {
        // Arrange: two inputs whose words interleave, including a tie on frequency.
        val first = DomainLens(mapOf("node-id" to DomainNode(listOf(DomainWord("alpha", 4), DomainWord("zulu", 9)))))
        val second = DomainLens(mapOf("node-id" to DomainNode(listOf(DomainWord("bravo", 4), DomainWord("mike", 20)))))

        // Act
        val merged = first.merge(second)

        // Assert: strongest first, ties read alphabetically so the output is reproducible.
        assertThat(merged.nodes["node-id"]!!.words.map { it.text }).containsExactly("mike", "zulu", "alpha", "bravo")
    }

    @Test
    fun `should leave the words of a node only one input carries untouched`() {
        // Arrange: a node whose words are in the producer's own order, e_g_ sorted by tfidf.
        val words = listOf(DomainWord("beta", 2, 0.9), DomainWord("alpha", 40, 0.1))
        val onlyInput = DomainLens(mapOf("node-id" to DomainNode(words)))

        // Act
        val merged = onlyInput.merge(DomainLens())

        // Assert: nothing to reconcile means nothing to re-order.
        assertThat(merged.nodes["node-id"]!!.words).isEqualTo(words)
    }

    @Test
    fun `should re-key its nodes onto a restructured tree`() {
        // Arrange: a two-node tree whose files are about to move under a new folder.
        val fileId = NodeId.fromSegments(listOf("src", "App.kt"), NodeType.File)
        val tree =
            Node("root", NodeType.Folder, children = setOf(Node("src", NodeType.Folder, children = setOf(Node("App.kt", NodeType.File)))))
        val lens = DomainLens(mapOf(fileId to DomainNode(listOf(DomainWord("order", 3)))))

        // Act
        val rekeyed = lens.rekeyed(tree) { segments -> if (segments.isEmpty()) segments else listOf("alpha") + segments }

        // Assert
        assertThat(rekeyed.nodes.keys).containsExactly(NodeId.fromSegments(listOf("alpha", "src", "App.kt"), NodeType.File))
    }

    @Test
    fun `should drop an entry for a node that the restructuring took away`() {
        // Arrange
        val fileId = NodeId.fromSegments(listOf("src", "App.kt"), NodeType.File)
        val tree =
            Node("root", NodeType.Folder, children = setOf(Node("src", NodeType.Folder, children = setOf(Node("App.kt", NodeType.File)))))
        val lens = DomainLens(mapOf(fileId to DomainNode(listOf(DomainWord("order", 3)))))

        // Act: nothing survives.
        val rekeyed = lens.rekeyed(tree) { null }

        // Assert: no key is left pointing at a node the output no longer has.
        assertThat(rekeyed.nodes).isEmpty()
    }
}
