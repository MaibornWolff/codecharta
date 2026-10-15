package de.maibornwolff.codecharta.analysers.tools.gate.rules

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class CycleChainsTest {
    private val foo = Declaration("a/Foo.kt", "Foo")
    private val bar = Declaration("b/Bar.kt", "Bar")
    private val baz = Declaration("b/Bar.kt", "Baz")

    @Test
    fun `should tell a cycle once, whichever of its declarations it is found from`() {
        // Arrange
        val dependencies = listOf(cyclic(foo, bar), cyclic(bar, foo))

        // Act
        val chains = findCycleChains(dependencies)

        // Assert
        assertThat(chains).containsExactly(listOf(cyclic(foo, bar), cyclic(bar, foo)))
    }

    @Test
    fun `should walk only the dependencies the parser marked cyclic`() {
        // Arrange
        val dependencies = listOf(cyclic(foo, bar), plain(bar, foo))

        // Act
        val chains = findCycleChains(dependencies)

        // Assert
        assertThat(chains).isEmpty()
    }

    @Test
    fun `should tell for each cyclic dependency the shortest way back as its own cycle`() {
        // Arrange
        val dependencies = listOf(cyclic(foo, bar), cyclic(bar, baz), cyclic(baz, foo), cyclic(bar, foo))

        // Act
        val chains = findCycleChains(dependencies)

        // Assert
        assertThat(chains).containsExactlyInAnyOrder(
            listOf(cyclic(foo, bar), cyclic(bar, foo)),
            listOf(cyclic(bar, baz), cyclic(baz, foo), cyclic(foo, bar))
        )
    }

    @Test
    fun `should take a dependency between two files as upward when the file dependency is upward`() {
        // Arrange
        val dependency = plain(foo, bar)
        val upwardOfFilePair = mapOf(("a/Foo.kt" to "b/Bar.kt") to true)

        // Act
        val isUpward = isUpward(dependency, upwardOfFilePair)

        // Assert
        assertThat(isUpward).isTrue()
    }

    @Test
    fun `should take a dependency inside one file as upward only by its own mark`() {
        // Arrange
        val marked = DeclarationDependency(bar, baz, isPointingUpwards = true)
        val unmarked = plain(bar, baz)

        // Act
        val markedIsUpward = isUpward(marked, mapOf(("b/Bar.kt" to "b/Bar.kt") to false))
        val unmarkedIsUpward = isUpward(unmarked, emptyMap())

        // Assert
        assertThat(markedIsUpward).isTrue()
        assertThat(unmarkedIsUpward).isFalse()
    }

    @Test
    fun `should fall back to the own mark of a dependency between files that have no file dependency`() {
        // Arrange
        val dependency = DeclarationDependency(foo, bar, isPointingUpwards = true)

        // Act
        val isUpward = isUpward(dependency, emptyMap())

        // Assert
        assertThat(isUpward).isTrue()
    }

    private fun cyclic(from: Declaration, to: Declaration) = DeclarationDependency(from, to, isCyclic = true)

    private fun plain(from: Declaration, to: Declaration) = DeclarationDependency(from, to)
}
