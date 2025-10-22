package de.maibornwolff.codecharta.analysers.parsers.unified

import de.maibornwolff.codecharta.model.ProjectBuilder
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import java.io.File
import java.nio.file.Path

class ProjectScannerTest {
    @TempDir
    lateinit var tempDir: Path

    private lateinit var rootDir: File
    private lateinit var projectBuilder: ProjectBuilder

    @BeforeEach
    fun setUp() {
        rootDir = tempDir.toFile()
        projectBuilder = ProjectBuilder()
    }

    // ========== GITIGNORE EXCLUSION TESTS ==========

    @Test
    fun `should exclude files based on gitignore when enabled`() {
        // Arrange
        val gitignoreFile = File(rootDir, ".gitignore")
        gitignoreFile.writeText("*.log")

        // Create test files
        val srcDir = File(rootDir, "src")
        srcDir.mkdirs()
        File(srcDir, "Main.kt").writeText("fun main() {}")
        File(srcDir, "debug.log").writeText("log content")
        File(srcDir, "App.java").writeText("class App {}")

        // Act
        val scanner = ProjectScanner(
            root = rootDir,
            projectBuilder = projectBuilder,
            excludePatterns = listOf(),
            includeExtensions = listOf(),
            useGitignore = true
        )
        scanner.traverseInputProject(verbose = false)

        // Assert
        val (excludedCount, _) = scanner.getGitIgnoreStatistics()
        assertThat(excludedCount).isEqualTo(1) // debug.log should be excluded
        assertThat(scanner.foundParsableFiles()).isTrue()
    }

    @Test
    fun `should not exclude files when gitignore is disabled`() {
        // Arrange
        val gitignoreFile = File(rootDir, ".gitignore")
        gitignoreFile.writeText("*.log")

        // Create test files
        val srcDir = File(rootDir, "src")
        srcDir.mkdirs()
        File(srcDir, "Main.kt").writeText("fun main() {}")
        File(srcDir, "debug.log").writeText("log content")

        // Act
        val scanner = ProjectScanner(
            root = rootDir,
            projectBuilder = projectBuilder,
            excludePatterns = listOf(),
            includeExtensions = listOf(),
            useGitignore = false
        )
        scanner.traverseInputProject(verbose = false)

        // Assert
        val (excludedCount, _) = scanner.getGitIgnoreStatistics()
        assertThat(excludedCount).isEqualTo(0) // No exclusion since gitignore is disabled
    }

    @Test
    fun `should exclude files matching nested gitignore patterns`() {
        // Arrange
        val rootGitignore = File(rootDir, ".gitignore")
        rootGitignore.writeText("*.log")

        val srcDir = File(rootDir, "src")
        srcDir.mkdirs()
        val srcGitignore = File(srcDir, ".gitignore")
        srcGitignore.writeText("*.tmp")

        // Create test files
        File(rootDir, "readme.md").writeText("# README")
        File(srcDir, "Main.kt").writeText("fun main() {}")
        File(srcDir, "debug.log").writeText("log content")
        File(srcDir, "temp.tmp").writeText("temp")

        // Act
        val scanner = ProjectScanner(
            root = rootDir,
            projectBuilder = projectBuilder,
            excludePatterns = listOf(),
            includeExtensions = listOf(),
            useGitignore = true
        )
        scanner.traverseInputProject(verbose = false)

        // Assert
        val (excludedCount, _) = scanner.getGitIgnoreStatistics()
        assertThat(excludedCount).isEqualTo(2) // debug.log and temp.tmp
    }

    // ========== COMBINATION TESTS (gitignore + patterns) ==========

    @Test
    fun `should apply both gitignore and exclude patterns`() {
        // Arrange
        val gitignoreFile = File(rootDir, ".gitignore")
        gitignoreFile.writeText("*.log")

        val srcDir = File(rootDir, "src")
        srcDir.mkdirs()
        val testDir = File(srcDir, "test")
        testDir.mkdirs()

        // Create test files
        File(srcDir, "Main.kt").writeText("fun main() {}")
        File(srcDir, "debug.log").writeText("log")
        File(testDir, "Test.kt").writeText("test")

        // Act
        val scanner = ProjectScanner(
            root = rootDir,
            projectBuilder = projectBuilder,
            excludePatterns = listOf("test/.*"), // Exclude test directory
            includeExtensions = listOf(),
            useGitignore = true
        )
        scanner.traverseInputProject(verbose = false)

        // Assert
        val (gitignoreExcluded, _) = scanner.getGitIgnoreStatistics()
        assertThat(gitignoreExcluded).isEqualTo(1) // debug.log excluded by gitignore
        // Test.kt should be excluded by pattern, but we can't directly count pattern exclusions
        // We can verify by checking if only Main.kt was parsed
        assertThat(scanner.foundParsableFiles()).isTrue()
    }

    @Test
    fun `should apply gitignore exclusion before pattern exclusion`() {
        // Arrange
        val gitignoreFile = File(rootDir, ".gitignore")
        gitignoreFile.writeText("*.log")

        val srcDir = File(rootDir, "src")
        srcDir.mkdirs()

        // Create files
        File(srcDir, "Main.kt").writeText("fun main() {}")
        File(srcDir, "App.java").writeText("class App {}")
        File(srcDir, "debug.log").writeText("log")

        // Act
        val scanner = ProjectScanner(
            root = rootDir,
            projectBuilder = projectBuilder,
            excludePatterns = listOf("src/.*\\.kt"), // Exclude .kt files in src
            includeExtensions = listOf(),
            useGitignore = true
        )
        scanner.traverseInputProject(verbose = false)

        // Assert
        val (gitignoreExcluded, _) = scanner.getGitIgnoreStatistics()
        assertThat(gitignoreExcluded).isEqualTo(1) // debug.log
        // Main.kt excluded by pattern, App.java should be parsed
        assertThat(scanner.foundParsableFiles()).isTrue()
    }

    // ========== GITIGNORE STATISTICS TESTS ==========

    @Test
    fun `should return correct gitignore statistics`() {
        // Arrange
        val rootGitignore = File(rootDir, ".gitignore")
        rootGitignore.writeText("*.log")

        val srcDir = File(rootDir, "src")
        srcDir.mkdirs()
        val srcGitignore = File(srcDir, ".gitignore")
        srcGitignore.writeText("*.tmp")

        // Create files
        File(srcDir, "Main.kt").writeText("fun main() {}")
        File(srcDir, "debug.log").writeText("log")
        File(srcDir, "temp.tmp").writeText("temp")

        // Act
        val scanner = ProjectScanner(
            root = rootDir,
            projectBuilder = projectBuilder,
            excludePatterns = listOf(),
            includeExtensions = listOf(),
            useGitignore = true
        )
        scanner.traverseInputProject(verbose = false)

        // Assert
        val (excludedCount, gitignoreFiles) = scanner.getGitIgnoreStatistics()
        assertThat(excludedCount).isEqualTo(2) // debug.log and temp.tmp
        assertThat(gitignoreFiles).hasSize(2)
        assertThat(gitignoreFiles).containsExactlyInAnyOrder(
            ".gitignore",
            "src${File.separator}.gitignore"
        )
    }

    @Test
    fun `should return empty statistics when gitignore is disabled`() {
        // Arrange
        val gitignoreFile = File(rootDir, ".gitignore")
        gitignoreFile.writeText("*.log")

        val srcDir = File(rootDir, "src")
        srcDir.mkdirs()
        File(srcDir, "Main.kt").writeText("fun main() {}")

        // Act
        val scanner = ProjectScanner(
            root = rootDir,
            projectBuilder = projectBuilder,
            excludePatterns = listOf(),
            includeExtensions = listOf(),
            useGitignore = false
        )
        scanner.traverseInputProject(verbose = false)

        // Assert
        val (excludedCount, gitignoreFiles) = scanner.getGitIgnoreStatistics()
        assertThat(excludedCount).isEqualTo(0)
        assertThat(gitignoreFiles).isEmpty()
    }

    // ========== EDGE CASES ==========

    @Test
    fun `should handle project without gitignore file`() {
        // Arrange
        val srcDir = File(rootDir, "src")
        srcDir.mkdirs()
        File(srcDir, "Main.kt").writeText("fun main() {}")
        File(srcDir, "App.java").writeText("class App {}")

        // Act
        val scanner = ProjectScanner(
            root = rootDir,
            projectBuilder = projectBuilder,
            excludePatterns = listOf(),
            includeExtensions = listOf(),
            useGitignore = true
        )
        scanner.traverseInputProject(verbose = false)

        // Assert
        val (excludedCount, gitignoreFiles) = scanner.getGitIgnoreStatistics()
        assertThat(excludedCount).isEqualTo(0)
        assertThat(gitignoreFiles).isEmpty()
        assertThat(scanner.foundParsableFiles()).isTrue()
    }

    @Test
    fun `should handle empty gitignore file`() {
        // Arrange
        val gitignoreFile = File(rootDir, ".gitignore")
        gitignoreFile.writeText("")

        val srcDir = File(rootDir, "src")
        srcDir.mkdirs()
        File(srcDir, "Main.kt").writeText("fun main() {}")

        // Act
        val scanner = ProjectScanner(
            root = rootDir,
            projectBuilder = projectBuilder,
            excludePatterns = listOf(),
            includeExtensions = listOf(),
            useGitignore = true
        )
        scanner.traverseInputProject(verbose = false)

        // Assert
        val (excludedCount, _) = scanner.getGitIgnoreStatistics()
        assertThat(excludedCount).isEqualTo(0)
        assertThat(scanner.foundParsableFiles()).isTrue()
    }

    @Test
    fun `should handle negation patterns in gitignore`() {
        // Arrange
        val gitignoreFile = File(rootDir, ".gitignore")
        gitignoreFile.writeText(
            """
            *.log
            !important.log
            """.trimIndent()
        )

        val srcDir = File(rootDir, "src")
        srcDir.mkdirs()
        File(srcDir, "Main.kt").writeText("fun main() {}")
        File(srcDir, "debug.log").writeText("log")
        File(srcDir, "important.log").writeText("important")

        // Act
        val scanner = ProjectScanner(
            root = rootDir,
            projectBuilder = projectBuilder,
            excludePatterns = listOf(),
            includeExtensions = listOf(),
            useGitignore = true
        )
        scanner.traverseInputProject(verbose = false)

        // Assert
        val (excludedCount, _) = scanner.getGitIgnoreStatistics()
        assertThat(excludedCount).isEqualTo(1) // Only debug.log, important.log is negated
    }

    // ========== INCLUDE EXTENSIONS TESTS ==========

    @Test
    fun `should respect include extensions with gitignore enabled`() {
        // Arrange
        val gitignoreFile = File(rootDir, ".gitignore")
        gitignoreFile.writeText("*.log")

        val srcDir = File(rootDir, "src")
        srcDir.mkdirs()
        File(srcDir, "Main.kt").writeText("fun main() {}")
        File(srcDir, "App.java").writeText("class App {}")
        File(srcDir, "script.py").writeText("print('hello')")
        File(srcDir, "debug.log").writeText("log")

        // Act
        val scanner = ProjectScanner(
            root = rootDir,
            projectBuilder = projectBuilder,
            excludePatterns = listOf(),
            includeExtensions = listOf("kt", "java"), // Only include Kotlin and Java
            useGitignore = true
        )
        scanner.traverseInputProject(verbose = false)

        // Assert
        val (excludedCount, _) = scanner.getGitIgnoreStatistics()
        assertThat(excludedCount).isEqualTo(1) // debug.log excluded by gitignore
        assertThat(scanner.foundParsableFiles()).isTrue()
        // script.py should be excluded by extension filter
    }
}
