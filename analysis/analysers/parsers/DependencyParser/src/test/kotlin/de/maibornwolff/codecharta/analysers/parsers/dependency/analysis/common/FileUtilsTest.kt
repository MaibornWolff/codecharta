package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.common

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class FileUtilsTest {
    @Test
    fun `should split unix-style path into parts`() {
        // Given
        val path = "src/main/kotlin/MyFile.kt"

        // When
        val parts = splitNameToParts(path)

        // Then
        assertThat(parts).containsExactly("src", "main", "kotlin", "MyFile.kt")
    }

    @Test
    fun `should split single filename without directory`() {
        // Given
        val path = "MyFile.kt"

        // When
        val parts = splitNameToParts(path)

        // Then
        assertThat(parts).containsExactly("MyFile.kt")
    }

    @Test
    fun `should handle path with trailing slash`() {
        // Given
        val path = "src/main/"

        // When
        val parts = splitNameToParts(path)

        // Then
        assertThat(parts).containsExactly("src", "main")
    }

    @Test
    fun `should handle empty string`() {
        // Given
        val path = ""

        // When
        val parts = splitNameToParts(path)

        // Then
        assertThat(parts).isEmpty()
    }
}
