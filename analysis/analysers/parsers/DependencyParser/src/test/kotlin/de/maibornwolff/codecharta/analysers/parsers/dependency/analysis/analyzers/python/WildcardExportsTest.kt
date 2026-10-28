package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.python

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import java.io.File

class WildcardExportsTest {
    private fun File.withFile(path: String, content: String): File {
        resolve(path).also { it.parentFile.mkdirs() }.writeText(content)
        return this
    }

    @Test
    fun `should export the names __all__ lists, also a private one`(
        @TempDir root: File
    ) {
        // Arrange
        root.withFile("app/models.py", "__all__ = [\"Model\", '_Secret']\n\nclass Model: pass\nclass Other: pass\n")

        // Act
        val exports = WildcardExports.of(root)

        // Assert
        assertThat(
            listOf("Model", "_Secret", "Other").map { exports.exports(listOf("app", "models"), it) }
        ).containsExactly(true, true, false)
    }

    @Test
    fun `should read __all__ written as a tuple over several lines`(
        @TempDir root: File
    ) {
        // Arrange
        root.withFile("app/__init__.py", "__all__ = (\n    \"Model\",\n)\n")

        // Act
        val exports = WildcardExports.of(root)

        // Assert
        assertThat(listOf("Model", "Other").map { exports.exports(listOf("app", "__init__"), it) }).containsExactly(true, false)
    }

    @Test
    fun `should export every name not starting with an underscore without __all__`(
        @TempDir root: File
    ) {
        // Arrange
        root.withFile("app/models.py", "class Model: pass\n")

        // Act
        val exports = WildcardExports.of(root)

        // Assert
        assertThat(listOf("Model", "_Secret").map { exports.exports(listOf("app", "models"), it) }).containsExactly(true, false)
    }
}
