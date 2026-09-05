package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class PathTest {
    @Test
    fun `should return path with dots`() {
        // Arrange
        val path = Path(listOf("com", "example", "Node"))

        // Act
        val result = path.withDots()

        // Assert
        assertThat(result).isEqualTo("com.example.Node")
    }

    @Test
    fun `should replace dots in parts with underscores`() {
        // Arrange, when
        val path = Path(listOf("com.example.Node"))

        // Assert
        assertThat(path.parts).containsExactly("com_example_Node")
    }

    @Test
    fun `should remove name`() {
        // Arrange
        val path = Path(listOf("com", "example", "Node"))

        // Act
        val result = path.withoutName()

        // Assert
        assertThat(result).containsExactly("com", "example")
    }

    @Test
    fun `should return unknown path`() {
        // Arrange, when
        val path = Path.unknown("type")

        // Assert
        assertThat(path.parts).containsExactly("<unknown>", "type")
    }

    @Test
    fun `should add part to path`() {
        // Arrange
        val path = Path(listOf("com", "example"))

        // Act
        val result = path + "Node"

        // Assert
        assertThat(result.parts).containsExactly("com", "example", "Node")
    }

    @Test
    fun `should create path from string with dots`() {
        // Arrange, when
        val path = Path.fromStringWithDots("com.example.Node")

        // Assert
        assertThat(path.parts).containsExactly("com", "example", "Node")
    }
}
