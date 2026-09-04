package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class PathTest {
    @Test
    fun `should return path with dots`() {
        // given
        val path = Path(listOf("com", "example", "Node"))

        // when
        val result = path.withDots()

        // then
        assertThat(result).isEqualTo("com.example.Node")
    }

    @Test
    fun `should replace dots in parts with underscores`() {
        // given, when
        val path = Path(listOf("com.example.Node"))

        // then
        assertThat(path.parts).containsExactly("com_example_Node")
    }

    @Test
    fun `should remove name`() {
        // given
        val path = Path(listOf("com", "example", "Node"))

        // when
        val result = path.withoutName()

        // then
        assertThat(result).containsExactly("com", "example")
    }

    @Test
    fun `should return unknown path`() {
        // given, when
        val path = Path.unknown("type")

        // then
        assertThat(path.parts).containsExactly("<unknown>", "type")
    }

    @Test
    fun `should add part to path`() {
        // given
        val path = Path(listOf("com", "example"))

        // when
        val result = path + "Node"

        // then
        assertThat(result.parts).containsExactly("com", "example", "Node")
    }

    @Test
    fun `should create path from string with dots`() {
        // given, when
        val path = Path.fromStringWithDots("com.example.Node")

        // then
        assertThat(path.parts).containsExactly("com", "example", "Node")
    }
}
