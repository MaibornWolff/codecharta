package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.input

import org.junit.jupiter.api.io.TempDir
import java.io.File
import java.nio.file.Path
import kotlin.test.Test
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class FileFilterTest {
    @Test
    fun `should return true when file extension matches`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val dir = tempDir.toFile()
        val file = File(dir, "test.txt")
        file.writeText("content")

        val filter = FileFilter(listOf("txt", "md"))

        // Act
        val result = filter.matchesExtension(file)

        // Assert
        assertTrue(result)
    }

    @Test
    fun `should return false when file extension does not match`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val dir = tempDir.toFile()
        val file = File(dir, "test.log")
        file.writeText("content")

        val filter = FileFilter(listOf("txt", "md"))

        // Act
        val result = filter.matchesExtension(file)

        // Assert
        assertFalse(result)
    }

    @Test
    fun `should match extension case insensitively`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val dir = tempDir.toFile()
        val file = File(dir, "TEST.TXT")
        file.writeText("content")

        val filter = FileFilter(listOf("txt"))

        // Act
        val result = filter.matchesExtension(file)

        // Assert
        assertTrue(result)
    }

    @Test
    fun `should match any allowed extension`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val dir = tempDir.toFile()
        val txtFile = File(dir, "file.txt")
        val mdFile = File(dir, "file.md")
        val ktFile = File(dir, "file.kt")
        val logFile = File(dir, "file.log")

        val filter = FileFilter(listOf("txt", "md", "kt"))

        // Act & Assert
        assertTrue(filter.matchesExtension(txtFile))
        assertTrue(filter.matchesExtension(mdFile))
        assertTrue(filter.matchesExtension(ktFile))
        assertFalse(filter.matchesExtension(logFile))
    }

    @Test
    fun `should handle files with multiple dots`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val dir = tempDir.toFile()
        val file = File(dir, "test.backup.txt")
        file.writeText("content")

        val filter = FileFilter(listOf("txt"))

        // Act
        val result = filter.matchesExtension(file)

        // Assert
        assertTrue(result)
    }

    @Test
    fun `should return false for files without extension`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val dir = tempDir.toFile()
        val file = File(dir, "README")
        file.writeText("content")

        val filter = FileFilter(listOf("txt", "md"))

        // Act
        val result = filter.matchesExtension(file)

        // Assert
        assertFalse(result)
    }

    @Test
    fun `should match when extension list contains mixed case`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val dir = tempDir.toFile()
        val file = File(dir, "test.TXT")
        file.writeText("content")

        val filter = FileFilter(listOf("TXT", "MD"))

        // Act
        val result = filter.matchesExtension(file)

        // Assert
        assertTrue(result)
    }
}
