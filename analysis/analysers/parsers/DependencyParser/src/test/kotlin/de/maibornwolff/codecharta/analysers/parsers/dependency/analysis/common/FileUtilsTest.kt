package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.common

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class FileUtilsTest {
    @Test
    fun `should split unix-style path into parts`() {
        // Arrange
        val path = "src/main/kotlin/MyFile.kt"

        // Act
        val parts = splitNameToParts(path)

        // Assert
        assertThat(parts).containsExactly("src", "main", "kotlin", "MyFile.kt")
    }

    @Test
    fun `should split single filename without directory`() {
        // Arrange
        val path = "MyFile.kt"

        // Act
        val parts = splitNameToParts(path)

        // Assert
        assertThat(parts).containsExactly("MyFile.kt")
    }

    @Test
    fun `should handle path with trailing slash`() {
        // Arrange
        val path = "src/main/"

        // Act
        val parts = splitNameToParts(path)

        // Assert
        assertThat(parts).containsExactly("src", "main")
    }

    @Test
    fun `should handle empty string`() {
        // Arrange
        val path = ""

        // Act
        val parts = splitNameToParts(path)

        // Assert
        assertThat(parts).isEmpty()
    }
}
