package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.input

import org.junit.jupiter.api.io.TempDir
import java.io.File
import java.nio.charset.Charset
import java.nio.file.Path
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue

private const val BYTE_ORDER_MARK = "\uFEFF"

class FileScannerTest {
    @Test
    fun `should scan files with allowed extensions recursively`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val dir = tempDir.toFile()
        File(dir, "test1.txt").writeText("content1")
        File(dir, "test2.md").writeText("content2")
        File(dir, "test3.log").writeText("content3")
        val subDir = File(dir, "subdir")
        subDir.mkdir()
        File(subDir, "test4.txt").writeText("content4")

        val scanner = FileScanner(allowedExtensions = listOf("txt", "md"))

        // Act
        val files = scanner.scan(dir.absolutePath)

        // Assert
        assertEquals(3, files.size)
        assertTrue(files.any { it.name == "test1.txt" })
        assertTrue(files.any { it.name == "test2.md" })
        assertTrue(files.any { it.name == "test4.txt" })
    }

    @Test
    fun `should read file contents`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val dir = tempDir.toFile()
        val file = File(dir, "test.txt")
        file.writeText("hello world\ntest content")

        val scanner = FileScanner(allowedExtensions = listOf("txt"))

        // Act
        val files = scanner.scan(dir.absolutePath)
        val content = scanner.readFileContent(files.first()).getOrThrow()

        // Assert
        assertEquals("hello world\ntest content", content)
    }

    @Test
    fun `should return empty list when no matching files found`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val dir = tempDir.toFile()
        File(dir, "test.log").writeText("content")

        val scanner = FileScanner(allowedExtensions = listOf("txt"))

        // Act
        val files = scanner.scan(dir.absolutePath)

        // Assert
        assertEquals(0, files.size)
    }

    @Test
    fun `should return empty list when directory does not exist`() {
        // Arrange
        val scanner = FileScanner(allowedExtensions = listOf("txt"))

        // Act
        val files = scanner.scan("/nonexistent/directory/path")

        // Assert
        assertEquals(0, files.size)
    }

    @Test
    fun `should scan a single file when the input path is a file`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val dir = tempDir.toFile()
        val file = File(dir, "test.txt")
        file.writeText("content")

        val scanner = FileScanner(allowedExtensions = listOf("txt"))

        // Act
        val files = scanner.scan(file.absolutePath)

        // Assert
        assertEquals(listOf(file), files)
    }

    @Test
    fun `should return empty list when the input file has an unsupported extension`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val file = File(tempDir.toFile(), "notes.md")
        file.writeText("content")

        val scanner = FileScanner(allowedExtensions = listOf("txt"))

        // Act
        val files = scanner.scan(file.absolutePath)

        // Assert
        assertEquals(0, files.size)
    }

    @Test
    fun `should ignore files matching gitignore patterns`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val dir = tempDir.toFile()
        File(dir, "keep.txt").writeText("keep")
        File(dir, "ignore.log").writeText("ignore")
        File(dir, "test.txt").writeText("test")
        File(dir, ".gitignore").writeText("*.log")

        val scanner = FileScanner(allowedExtensions = listOf("txt", "log"))

        // Act
        val files = scanner.scan(dir.absolutePath)

        // Assert
        assertEquals(2, files.size)
        assertTrue(files.any { it.name == "keep.txt" })
        assertTrue(files.any { it.name == "test.txt" })
        assertTrue(files.none { it.name == "ignore.log" })
    }

    @Test
    fun `should ignore directories matching gitignore patterns`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val dir = tempDir.toFile()
        File(dir, "root.txt").writeText("root")

        val keepDir = File(dir, "keep")
        keepDir.mkdir()
        File(keepDir, "file.txt").writeText("keep")

        val ignoreDir = File(dir, "build")
        ignoreDir.mkdir()
        File(ignoreDir, "output.txt").writeText("ignore")

        File(dir, ".gitignore").writeText("build/")

        val scanner = FileScanner(allowedExtensions = listOf("txt"))

        // Act
        val files = scanner.scan(dir.absolutePath)

        // Assert
        assertEquals(2, files.size)
        assertTrue(files.any { it.name == "root.txt" })
        assertTrue(files.any { it.name == "file.txt" })
        assertTrue(files.none { it.name == "output.txt" })
    }

    @Test
    fun `should respect nested gitignore files`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val dir = tempDir.toFile()
        File(dir, "root.txt").writeText("root")
        File(dir, ".gitignore").writeText("*.log")

        val subDir = File(dir, "subdir")
        subDir.mkdir()
        File(subDir, "sub.txt").writeText("sub")
        File(subDir, "debug.log").writeText("ignore")
        File(subDir, "temp.tmp").writeText("also ignore")
        File(subDir, ".gitignore").writeText("*.tmp")

        val scanner = FileScanner(allowedExtensions = listOf("txt", "log", "tmp"))

        // Act
        val files = scanner.scan(dir.absolutePath)

        // Assert
        assertEquals(2, files.size)
        assertTrue(files.any { it.name == "root.txt" })
        assertTrue(files.any { it.name == "sub.txt" })
        assertTrue(files.none { it.name == "debug.log" })
        assertTrue(files.none { it.name == "temp.tmp" })
    }

    @Test
    fun `should scan normally when gitignore is bypassed`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val dir = tempDir.toFile()
        File(dir, "keep.txt").writeText("keep")
        File(dir, "ignore.log").writeText("also keep")
        File(dir, ".gitignore").writeText("*.log")

        val scanner = FileScanner(allowedExtensions = listOf("txt", "log"))

        // Act
        val files = scanner.scan(dir.absolutePath, bypassGitignore = true)

        // Assert
        assertEquals(2, files.size)
        assertTrue(files.any { it.name == "keep.txt" })
        assertTrue(files.any { it.name == "ignore.log" })
    }

    @Test
    fun `should read file with UTF-8 encoding`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val dir = tempDir.toFile()
        val file = File(dir, "test.txt")
        val content = "Hello 世界 🌍"
        file.writeText(content, Charsets.UTF_8)

        val scanner = FileScanner(allowedExtensions = listOf("txt"))

        // Act
        val result = scanner.readFileContent(file, Charsets.UTF_8).getOrThrow()

        // Assert
        assertEquals(content, result)
    }

    @Test
    fun `should read file with UTF-16 encoding`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val dir = tempDir.toFile()
        val file = File(dir, "test.txt")
        val content = "Hello UTF-16"
        file.writeText(content, Charsets.UTF_16)

        val scanner = FileScanner(allowedExtensions = listOf("txt"))

        // Act
        val result = scanner.readFileContent(file, Charsets.UTF_16).getOrThrow()

        // Assert
        assertEquals(content, result)
    }

    @Test
    fun `should read file with ISO-8859-1 encoding`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val dir = tempDir.toFile()
        val file = File(dir, "test.txt")
        val content = "Hello ISO-8859-1"
        file.writeText(content, Charset.forName("ISO-8859-1"))

        val scanner = FileScanner(allowedExtensions = listOf("txt"))

        // Act
        val result = scanner.readFileContent(file, Charset.forName("ISO-8859-1")).getOrThrow()

        // Assert
        assertEquals(content, result)
    }

    @Test
    fun `should read file using default UTF-8 encoding when charset not specified`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val dir = tempDir.toFile()
        val file = File(dir, "test.txt")
        val content = "Hello world"
        file.writeText(content, Charsets.UTF_8)

        val scanner = FileScanner(allowedExtensions = listOf("txt"))

        // Act
        val result = scanner.readFileContent(file).getOrThrow()

        // Assert
        assertEquals(content, result)
    }

    @Test
    fun `should strip byte order mark when reading a UTF-8 file that starts with one`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val dir = tempDir.toFile()
        val file = File(dir, "Class1.cs")
        val content = "namespace IntegrationTests\n{\n    public class Class1\n    {\n    }\n}\n"
        file.writeBytes(BYTE_ORDER_MARK.toByteArray(Charsets.UTF_8) + content.toByteArray(Charsets.UTF_8))

        val scanner = FileScanner(allowedExtensions = listOf("cs"))

        // Act
        val result = scanner.readFileContent(file).getOrThrow()

        // Assert
        assertEquals(content, result)
    }

    @Test
    fun `should strip byte order mark when it occurs in the middle of a file`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val dir = tempDir.toFile()
        val file = File(dir, "Marker.cs")
        val content = "public class Class1$BYTE_ORDER_MARK { }"
        file.writeText(content, Charsets.UTF_8)

        val scanner = FileScanner(allowedExtensions = listOf("cs"))

        // Act
        val result = scanner.readFileContent(file).getOrThrow()

        // Assert
        assertEquals("public class Class1 { }", result)
    }

    @Test
    fun `should handle large file efficiently`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val dir = tempDir.toFile()
        val file = File(dir, "large.txt")
        val largeContent = "a".repeat(1_000_000)
        file.writeText(largeContent)

        val scanner = FileScanner(allowedExtensions = listOf("txt"))

        // Act
        val result = scanner.readFileContent(file).getOrThrow()

        // Assert
        assertEquals(1_000_000, result.length)
    }

    @Test
    fun `should return failure when reading non-existent file`() {
        // Arrange
        val scanner = FileScanner(allowedExtensions = listOf("txt"))
        val nonExistentFile = File("/nonexistent/path/to/file.txt")

        // Act
        val result = scanner.readFileContent(nonExistentFile)

        // Assert
        assertTrue(result.isFailure)
        assertTrue(result.exceptionOrNull() is IllegalArgumentException)
    }

    @Test
    fun `should return failure when reading directory instead of file`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val dir = tempDir.toFile()
        val scanner = FileScanner(allowedExtensions = listOf("txt"))

        // Act
        val result = scanner.readFileContent(dir)

        // Assert
        assertTrue(result.isFailure)
        assertTrue(result.exceptionOrNull() is IllegalArgumentException)
    }

    @Test
    fun `should return failure when file deleted after scan but before read`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val dir = tempDir.toFile()
        val file = File(dir, "test.txt")
        file.writeText("content")

        val scanner = FileScanner(allowedExtensions = listOf("txt"))

        // Act
        val files = scanner.scan(dir.absolutePath)
        assertEquals(1, files.size)

        file.delete()

        // Assert
        val result = scanner.readFileContent(files.first())
        assertTrue(result.isFailure)
    }

    @Test
    fun `should handle file modified concurrently during read`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val dir = tempDir.toFile()
        val file = File(dir, "test.txt")
        val originalContent = "original content"
        file.writeText(originalContent)

        val scanner = FileScanner(allowedExtensions = listOf("txt"))

        // Act
        val files = scanner.scan(dir.absolutePath)
        assertEquals(1, files.size)

        file.writeText("modified content")

        // Assert - should read modified content without error
        val content = scanner.readFileContent(files.first()).getOrThrow()
        assertEquals("modified content", content)
    }

    @Test
    fun `should handle directory structure changes after scan`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val dir = tempDir.toFile()
        File(dir, "file1.txt").writeText("content1")
        File(dir, "file2.txt").writeText("content2")

        val scanner = FileScanner(allowedExtensions = listOf("txt"))

        // Act
        val files = scanner.scan(dir.absolutePath)
        assertEquals(2, files.size)

        val newDir = File(dir, "newdir")
        newDir.mkdir()
        File(newDir, "file3.txt").writeText("content3")

        // Assert - original scan results remain valid
        assertTrue(files.all { it.exists() })
        assertEquals(2, files.size)

        val newScan = scanner.scan(dir.absolutePath)
        assertEquals(3, newScan.size)
    }

    @Test
    fun `should exclude test files when excludeTests is true`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val dir = tempDir.toFile()
        File(dir, "User.kt").writeText("class User")
        File(dir, "UserTest.kt").writeText("class UserTest")
        File(dir, "Service.kt").writeText("class Service")
        File(dir, "ServiceTest.kt").writeText("class ServiceTest")

        val scanner = FileScanner(allowedExtensions = listOf("kt"))

        // Act
        val files = scanner.scan(dir.absolutePath, bypassGitignore = false, excludeTests = true)

        // Assert
        assertEquals(2, files.size)
        assertTrue(files.any { it.name == "User.kt" })
        assertTrue(files.any { it.name == "Service.kt" })
        assertFalse(files.any { it.name == "UserTest.kt" })
        assertFalse(files.any { it.name == "ServiceTest.kt" })
    }

    @Test
    fun `should include test files when excludeTests is false`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val dir = tempDir.toFile()
        File(dir, "User.kt").writeText("class User")
        File(dir, "UserTest.kt").writeText("class UserTest")

        val scanner = FileScanner(allowedExtensions = listOf("kt"))

        // Act
        val files = scanner.scan(dir.absolutePath, bypassGitignore = false, excludeTests = false)

        // Assert
        assertEquals(2, files.size)
        assertTrue(files.any { it.name == "User.kt" })
        assertTrue(files.any { it.name == "UserTest.kt" })
    }

    @Test
    fun `should exclude files in test directories when excludeTests is true`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val dir = tempDir.toFile()
        val testDir = File(dir, "test")
        testDir.mkdir()
        File(dir, "User.kt").writeText("class User")
        File(testDir, "UserTest.kt").writeText("class UserTest")

        val scanner = FileScanner(allowedExtensions = listOf("kt"))

        // Act
        val files = scanner.scan(dir.absolutePath, bypassGitignore = false, excludeTests = true)

        // Assert
        assertEquals(1, files.size)
        assertTrue(files.any { it.name == "User.kt" })
        assertFalse(files.any { it.name == "UserTest.kt" })
    }

    @Test
    fun `should exclude TypeScript test files with test pattern when excludeTests is true`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val dir = tempDir.toFile()
        File(dir, "user.ts").writeText("export class User")
        File(dir, "user.test.ts").writeText("describe('User')")
        File(dir, "service.spec.ts").writeText("describe('Service')")

        val scanner = FileScanner(allowedExtensions = listOf("ts"))

        // Act
        val files = scanner.scan(dir.absolutePath, bypassGitignore = false, excludeTests = true)

        // Assert
        assertEquals(1, files.size)
        assertTrue(files.any { it.name == "user.ts" })
        assertFalse(files.any { it.name == "user.test.ts" })
        assertFalse(files.any { it.name == "service.spec.ts" })
    }

    @Test
    fun `should exclude Python test files when excludeTests is true`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val dir = tempDir.toFile()
        File(dir, "user.py").writeText("class User")
        File(dir, "test_user.py").writeText("def test_user()")
        File(dir, "service_test.py").writeText("def test_service()")

        val scanner = FileScanner(allowedExtensions = listOf("py"))

        // Act
        val files = scanner.scan(dir.absolutePath, bypassGitignore = false, excludeTests = true)

        // Assert
        assertEquals(1, files.size)
        assertTrue(files.any { it.name == "user.py" })
        assertFalse(files.any { it.name == "test_user.py" })
        assertFalse(files.any { it.name == "service_test.py" })
    }

    @Test
    fun `should exclude test files when both bypassGitignore and excludeTests are true`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val dir = tempDir.toFile()
        File(dir, "User.kt").writeText("class User")
        File(dir, "UserTest.kt").writeText("class UserTest")
        File(dir, ".gitignore").writeText("*.kt")

        val scanner = FileScanner(allowedExtensions = listOf("kt"))

        // Act
        val files = scanner.scan(dir.absolutePath, bypassGitignore = true, excludeTests = true)

        // Assert
        assertEquals(1, files.size)
        assertTrue(files.any { it.name == "User.kt" })
        assertFalse(files.any { it.name == "UserTest.kt" })
    }

    @Test
    fun `should exclude files in multiple test directory types when excludeTests is true`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val dir = tempDir.toFile()
        val testDir = File(dir, "test")
        val testsDir = File(dir, "tests")
        val testsDunderDir = File(dir, "__tests__")
        val specDir = File(dir, "spec")
        val specsDir = File(dir, "specs")

        testDir.mkdir()
        testsDir.mkdir()
        testsDunderDir.mkdir()
        specDir.mkdir()
        specsDir.mkdir()

        File(dir, "User.kt").writeText("class User")
        File(testDir, "Test1.kt").writeText("test1")
        File(testsDir, "Test2.kt").writeText("test2")
        File(testsDunderDir, "Test3.kt").writeText("test3")
        File(specDir, "Test4.kt").writeText("test4")
        File(specsDir, "Test5.kt").writeText("test5")

        val scanner = FileScanner(allowedExtensions = listOf("kt"))

        // Act
        val files = scanner.scan(dir.absolutePath, bypassGitignore = false, excludeTests = true)

        // Assert
        assertEquals(1, files.size)
        assertTrue(files.any { it.name == "User.kt" })
    }
}
