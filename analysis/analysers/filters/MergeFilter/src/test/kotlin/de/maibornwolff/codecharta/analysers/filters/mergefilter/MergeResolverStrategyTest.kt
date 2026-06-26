package de.maibornwolff.codecharta.analysers.filters.mergefilter

import de.maibornwolff.codecharta.model.MutableNode
import de.maibornwolff.codecharta.model.NodeType
import de.maibornwolff.codecharta.model.Path
import de.maibornwolff.codecharta.util.Logger
import io.mockk.every
import io.mockk.mockkObject
import io.mockk.unmockkAll
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test

class MergeResolverStrategyTest {
    private fun leaf(path: String, attributes: Map<String, Any>, checksum: String? = null): Pair<List<String>, MutableNode> {
        val segments = path.split("/").filter { it.isNotEmpty() }
        return segments to MutableNode(segments.last(), NodeType.File, attributes, checksum = checksum)
    }

    private fun tree(vararg leaves: Pair<List<String>, MutableNode>): MutableNode {
        val root = MutableNode("root", NodeType.Folder)
        leaves.forEach { (segments, node) -> root.insertAt(Path(segments.dropLast(1)), node) }
        return root
    }

    private fun merge(strategy: MergeResolverStrategy, reference: MutableNode, incoming: MutableNode): MutableNode =
        strategy.mergeNodeLists(listOf(listOf(reference), listOf(incoming))).single()

    private fun MutableNode.leafByName(name: String): MutableNode? = leaves.values.firstOrNull { it.name == name }

    @Test
    fun `should merge nodes that share the exact same tree position`() {
        val reference = tree(leaf("/src/App.kt", mapOf("a" to 1.0)))
        val incoming = tree(leaf("/src/App.kt", mapOf("b" to 2.0)))

        val merged = merge(MergeResolverStrategy.leaf(false), reference, incoming)

        val app = merged.leafByName("App.kt")!!
        assertTrue(app.attributes.containsKey("a") && app.attributes.containsKey("b"))
    }

    @Test
    fun `should merge a renamed file by its unique content hash`() {
        val reference = tree(leaf("/src/Application.kt", mapOf("a" to 1.0), checksum = "hash-1"))
        val incoming = tree(leaf("/lib/App.kt", mapOf("b" to 2.0), checksum = "hash-1"))

        val merged = merge(MergeResolverStrategy.leaf(false), reference, incoming)

        val mergedLeaf = merged.leaves.values.single()
        assertTrue(mergedLeaf.attributes.containsKey("a") && mergedLeaf.attributes.containsKey("b"))
    }

    @Test
    fun `should merge a differently-rooted file by its longest path suffix`() {
        val reference = tree(leaf("/backend/src/App.kt", mapOf("a" to 1.0)))
        val incoming = tree(leaf("/App.kt", mapOf("b" to 2.0)))

        val merged = merge(MergeResolverStrategy.leaf(false), reference, incoming)

        val app = merged.leafByName("App.kt")!!
        assertTrue(app.attributes.containsKey("a") && app.attributes.containsKey("b"))
    }

    @Test
    fun `should not merge duplicate content because the content hash is ambiguous`() {
        val reference =
            tree(
                leaf("/a/README.md", mapOf("a" to 1.0), checksum = "dup"),
                leaf("/b/README.md", mapOf("b" to 2.0), checksum = "dup")
            )
        val incoming = tree(leaf("/c/OTHER.md", mapOf("c" to 3.0), checksum = "dup"))

        val merged = merge(MergeResolverStrategy.leaf(true), reference, incoming)

        // The two reference READMEs keep their distinct single attribute; OTHER.md is kept separately.
        assertEquals(
            setOf("a"),
            merged.leaves.values
                .first { it.name == "README.md" && it.attributes.containsKey("a") }
                .attributes.keys
        )
        assertNotNull(merged.leafByName("OTHER.md"))
        assertEquals(3, merged.leaves.size)
    }

    @Test
    fun `should keep an unmatched node when the add-missing flag is set`() {
        val reference = tree(leaf("/src/App.kt", mapOf("a" to 1.0)))
        val incoming = tree(leaf("/totally/different/Thing.py", mapOf("b" to 2.0)))

        val merged = merge(MergeResolverStrategy.leaf(true), reference, incoming)

        assertNotNull(merged.leafByName("Thing.py"))
    }

    @Test
    fun `should drop an unmatched node when the add-missing flag is not set`() {
        val reference = tree(leaf("/src/App.kt", mapOf("a" to 1.0)))
        val incoming = tree(leaf("/totally/different/Thing.py", mapOf("b" to 2.0)))

        val merged = merge(MergeResolverStrategy.leaf(false), reference, incoming)

        assertNull(merged.leafByName("Thing.py"))
    }

    @Test
    fun `should match by exact position case-insensitively when ignoreCase is set`() {
        val reference = tree(leaf("/App.kt", mapOf("a" to 1.0)))
        val incoming = tree(leaf("/APP.KT", mapOf("b" to 2.0)))

        val caseInsensitive = merge(MergeResolverStrategy.leaf(false, ignoreCase = true), reference, incoming)
        val caseSensitive =
            merge(
                MergeResolverStrategy.leaf(false, ignoreCase = false),
                tree(leaf("/App.kt", mapOf("a" to 1.0))),
                tree(
                    leaf(
                        "/APP.KT",
                        mapOf(
                            "b" to 2.0
                        )
                    )
                )
            )

        assertTrue(
            caseInsensitive.leaves.values
                .single()
                .attributes.keys
                .containsAll(setOf("a", "b"))
        )
        assertEquals(1, caseSensitive.leaves.size) // APP.KT is unmatched and dropped, only App.kt remains
    }

    @Test
    fun `should report union mode merges edges and overlay mode does not`() {
        assertTrue(MergeResolverStrategy.recursive().mergesEdges)
        assertTrue(!MergeResolverStrategy.leaf(false).mergesEdges)
    }

    @Test
    fun `should not merge by suffix when two reference paths tie on the best suffix fit`() {
        // Arrange: two references share the same App.kt tail, so the suffix match is ambiguous.
        val reference =
            tree(
                leaf("/backend/src/App.kt", mapOf("a" to 1.0)),
                leaf("/frontend/src/App.kt", mapOf("b" to 2.0))
            )
        val incoming = tree(leaf("/src/App.kt", mapOf("c" to 3.0)))

        // Act
        val merged = merge(MergeResolverStrategy.leaf(true), reference, incoming)

        // Assert: the ambiguous suffix is not guessed; the incoming node is kept separately.
        assertEquals(3, merged.leaves.size)
    }

    @Test
    fun `should match a differently-rooted file by suffix case-insensitively when ignoreCase is set`() {
        // Arrange
        val reference = tree(leaf("/backend/src/App.kt", mapOf("a" to 1.0)))
        val incoming = tree(leaf("/APP.KT", mapOf("b" to 2.0)))

        // Act
        val merged = merge(MergeResolverStrategy.leaf(false, ignoreCase = true), reference, incoming)

        // Assert
        assertThat(merged.leaves.values.single().attributes).containsKeys("a", "b")
    }

    @Test
    fun `should report stats per merge run and not accumulate across runs with a fresh strategy`() {
        // Arrange: capture the stats logged by logMergeStats.
        mockkObject(Logger)
        val stats = mutableListOf<String>()
        every { Logger.info(any()) } answers { stats.add(firstArg<() -> String>().invoke()) }
        try {
            // Act: two independent runs, each with a fresh strategy (as MergeFilter does per group).
            val firstStrategy = MergeResolverStrategy.recursive()
            merge(firstStrategy, tree(leaf("/src/App.kt", mapOf("a" to 1.0))), tree(leaf("/src/App.kt", mapOf("b" to 2.0))))
            firstStrategy.logMergeStats()
            val firstStats = stats.last()

            stats.clear()
            val secondStrategy = MergeResolverStrategy.recursive()
            merge(secondStrategy, tree(leaf("/src/App.kt", mapOf("a" to 1.0))), tree(leaf("/src/App.kt", mapOf("b" to 2.0))))
            secondStrategy.logMergeStats()
            val secondStats = stats.last()

            // Assert: a fresh strategy reports its own run's counts; they do not accumulate.
            assertEquals(firstStats, secondStats)
        } finally {
            unmockkAll()
        }
    }
}
