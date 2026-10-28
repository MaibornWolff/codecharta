package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.common

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import java.util.concurrent.ConcurrentHashMap

class ParallelReadsTest {
    @Test
    fun `should read every item`() {
        // Arrange
        val items = (1..100).toList()
        val read = ConcurrentHashMap.newKeySet<Int>()

        // Act
        readInParallel(items) { read.add(it) }

        // Assert
        assertThat(read).containsExactlyInAnyOrderElementsOf(items)
    }

    @Test
    fun `should read the other items when one fails`() {
        // Arrange
        val items = listOf("a", "broken", "c")
        val read = ConcurrentHashMap.newKeySet<String>()

        // Act
        readInParallel(items) { item ->
            check(item != "broken")
            read.add(item)
        }

        // Assert
        assertThat(read).containsExactlyInAnyOrder("a", "c")
    }

    @Test
    fun `should map every item in the order of the items`() {
        // Arrange
        val items = (1..1000).toList()

        // Act
        val mapped = mapInParallel(items) { it * 2 }

        // Assert
        assertThat(mapped).containsExactlyElementsOf(items.map { it * 2 })
    }
}
