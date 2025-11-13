package de.maibornwolff.codecharta.analysers.tools.metricthresholdchecker.output.formatters

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class PathFormatterTest {
    @Test
    fun `should return path unchanged when shorter than max width`() {
        // Arrange
        val formatter = PathFormatter()
        val path = "short/path.kt"
        val maxWidth = 20

        // Act
        val result = formatter.truncate(path, maxWidth)

        // Assert
        assertThat(result).isEqualTo("short/path.kt")
    }

    @Test
    fun `should return path unchanged when equal to max width`() {
        // Arrange
        val formatter = PathFormatter()
        val path = "exactly20chars.kt12"
        val maxWidth = 19

        // Act
        val result = formatter.truncate(path, maxWidth)

        // Assert
        assertThat(result).isEqualTo("exactly20chars.kt12")
    }

    @Test
    fun `should truncate long path with ellipsis at start`() {
        // Arrange
        val formatter = PathFormatter()
        val path = "very/long/path/with/many/directories/File.kt"
        val maxWidth = 20

        // Act
        val result = formatter.truncate(path, maxWidth)

        // Assert
        assertThat(result).isEqualTo("...rectories/File.kt")
    }

    @Test
    fun `should preserve end of path with ellipsis at start`() {
        // Arrange
        val formatter = PathFormatter()
        val path = "src/main/kotlin/package/Foo.kt"
        val maxWidth = 20

        // Act
        val result = formatter.truncate(path, maxWidth)

        // Assert
        assertThat(result).isEqualTo("...in/package/Foo.kt")
    }

    @Test
    fun `should handle very short max width`() {
        // Arrange
        val formatter = PathFormatter()
        val path = "some/long/path/File.kt"
        val maxWidth = 10

        // Act
        val result = formatter.truncate(path, maxWidth)

        // Assert
        assertThat(result).hasSize(10)
        assertThat(result).contains("...")
    }

    @Test
    fun `should handle empty path`() {
        // Arrange
        val formatter = PathFormatter()
        val path = ""
        val maxWidth = 20

        // Act
        val result = formatter.truncate(path, maxWidth)

        // Assert
        assertThat(result).isEmpty()
    }

    @Test
    fun `should handle single character path`() {
        // Arrange
        val formatter = PathFormatter()
        val path = "a"
        val maxWidth = 20

        // Act
        val result = formatter.truncate(path, maxWidth)

        // Assert
        assertThat(result).isEqualTo("a")
    }
}
