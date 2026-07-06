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
        assertThat(app.attributes).containsKeys("a", "b")
    }

    @Test
    fun `should merge a renamed file by its unique content hash`() {
        val reference = tree(leaf("/src/Application.kt", mapOf("a" to 1.0), checksum = "hash-1"))
        val incoming = tree(leaf("/lib/App.kt", mapOf("b" to 2.0), checksum = "hash-1"))

        val merged = merge(MergeResolverStrategy.leaf(false), reference, incoming)

        val mergedLeaf = merged.leaves.values.single()
        assertThat(mergedLeaf.attributes).containsKeys("a", "b")
    }

    @Test
    fun `should merge a differently-rooted file by its longest path suffix`() {
        val reference = tree(leaf("/backend/src/App.kt", mapOf("a" to 1.0)))
        val incoming = tree(leaf("/App.kt", mapOf("b" to 2.0)))

        val merged = merge(MergeResolverStrategy.leaf(false), reference, incoming)

        val app = merged.leafByName("App.kt")!!
        assertThat(app.attributes).containsKeys("a", "b")
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
    fun `should not silently drop an incoming leaf when two incoming leaves share the same content hash`() {
        // Arrange: one reference leaf and two incoming leaves that are byte-identical to it.
        val reference = tree(leaf("/src/App.kt", mapOf("a" to 1.0), checksum = "shared"))
        val incoming =
            tree(
                leaf("/lib/One.kt", mapOf("b" to 2.0), checksum = "shared"),
                leaf("/lib/Two.kt", mapOf("c" to 3.0), checksum = "shared")
            )

        // Act
        val merged = merge(MergeResolverStrategy.leaf(true), reference, incoming)

        // Assert: neither incoming leaf is guessed onto App.kt; both survive and App.kt is untouched.
        assertEquals(3, merged.leaves.size)
        assertNotNull(merged.leafByName("One.kt"))
        assertNotNull(merged.leafByName("Two.kt"))
        assertEquals(setOf("a"), merged.leafByName("App.kt")!!.attributes.keys)
    }

    @Test
    fun `should not mis-merge coincidentally identical boilerplate onto an unrelated reference node`() {
        // Arrange: an unrelated reference config and two incoming configs with identical empty content.
        val reference = tree(leaf("/config/prod.yaml", mapOf("a" to 1.0), checksum = "boilerplate"))
        val incoming =
            tree(
                leaf("/config/dev.yaml", mapOf("b" to 2.0), checksum = "boilerplate"),
                leaf("/config/test.yaml", mapOf("c" to 3.0), checksum = "boilerplate")
            )

        // Act
        val merged = merge(MergeResolverStrategy.leaf(true), reference, incoming)

        // Assert: prod.yaml keeps only its own attribute; the boilerplate configs are kept separately.
        assertEquals(setOf("a"), merged.leafByName("prod.yaml")!!.attributes.keys)
        assertNotNull(merged.leafByName("dev.yaml"))
        assertNotNull(merged.leafByName("test.yaml"))
        assertEquals(3, merged.leaves.size)
    }

    @Test
    fun `should not silently drop an incoming leaf when two incoming leaves suffix-match the same reference path`() {
        // Arrange: one reference leaf and two differently-rooted incoming leaves that share its tail name
        // (no checksums, so they reach the path-suffix stage rather than content matching).
        val reference = tree(leaf("/a/b/File.kt", mapOf("a" to 1.0)))
        val incoming =
            tree(
                leaf("/x/File.kt", mapOf("b" to 2.0)),
                leaf("/y/File.kt", mapOf("c" to 3.0))
            )

        // Act
        val merged = merge(MergeResolverStrategy.leaf(true), reference, incoming)

        // Assert: the suffix match is ambiguous, so neither incoming is guessed onto File.kt; all three
        // survive with their own single attribute (nothing was merged/overwritten).
        assertEquals(3, merged.leaves.size)
        assertTrue(merged.leaves.values.all { it.attributes.size == 1 })
        assertEquals(setOf(setOf("a"), setOf("b"), setOf("c")), merged.leaves.values.map { it.attributes.keys }.toSet())
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
        // Arrange
        val reference = tree(leaf("/App.kt", mapOf("a" to 1.0)))
        val incoming = tree(leaf("/APP.KT", mapOf("b" to 2.0)))

        // Act
        val merged = merge(MergeResolverStrategy.leaf(false, ignoreCase = true), reference, incoming)

        // Assert
        assertThat(merged.leaves.values.single().attributes).containsKeys("a", "b")
    }

    @Test
    fun `should drop a case-differing node when ignoreCase is not set`() {
        // Arrange
        val reference = tree(leaf("/App.kt", mapOf("a" to 1.0)))
        val incoming = tree(leaf("/APP.KT", mapOf("b" to 2.0)))

        // Act
        val merged = merge(MergeResolverStrategy.leaf(false, ignoreCase = false), reference, incoming)

        // Assert: APP.KT is unmatched and dropped, only App.kt remains.
        assertThat(merged.leaves).hasSize(1)
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
    fun `should accumulate stats when a strategy is reused but not when a fresh one is used per run`() {
        // Arrange: capture the processed-node count logged by logMergeStats.
        mockkObject(Logger)
        val stats = mutableListOf<String>()
        every { Logger.info(any()) } answers { stats.add(firstArg<() -> String>().invoke()) }
        try {
            // Act: reuse ONE strategy across two merges (the cross-MIMO-group bug the factory avoids).
            val reused = MergeResolverStrategy.recursive()
            merge(reused, tree(leaf("/src/App.kt", mapOf("a" to 1.0))), tree(leaf("/src/App.kt", mapOf("b" to 2.0))))
            reused.logMergeStats()
            val firstRun = processedCount(stats.last())
            stats.clear()
            merge(reused, tree(leaf("/src/App.kt", mapOf("a" to 1.0))), tree(leaf("/src/App.kt", mapOf("b" to 2.0))))
            reused.logMergeStats()
            val reusedSecondRun = processedCount(stats.last())

            // A fresh strategy (as MergeFilter now builds per group) reports only its own run's count.
            stats.clear()
            val fresh = MergeResolverStrategy.recursive()
            merge(fresh, tree(leaf("/src/App.kt", mapOf("a" to 1.0))), tree(leaf("/src/App.kt", mapOf("b" to 2.0))))
            fresh.logMergeStats()
            val freshRun = processedCount(stats.last())

            // Assert: a reused instance accumulates across runs; a fresh one does not.
            assertTrue(reusedSecondRun > firstRun)
            assertEquals(firstRun, freshRun)
        } finally {
            unmockkAll()
        }
    }

    private fun processedCount(stats: String): Int = Regex("""(\d+) nodes were processed""").find(stats)!!.groupValues[1].toInt()
}
