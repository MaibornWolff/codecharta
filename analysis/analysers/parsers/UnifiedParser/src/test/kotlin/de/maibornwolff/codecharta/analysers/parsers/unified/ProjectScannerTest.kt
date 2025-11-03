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

    private fun getParsedFilePaths(): List<String> {
        val project = projectBuilder.build()
        return project.rootNode.leaves.keys.map { it.edgesList.joinToString("/") }
    }

    // ========== GITIGNORE EXCLUSION TESTS ==========

    @Test
    fun `should exclude files based on gitignore when enabled`() {
        // Arrange
        val gitignoreFile = File(rootDir, ".gitignore")
        gitignoreFile.writeText("*.java")

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
        val (excludedCount, _) = scanner.getGitIgnoreStatistics()
        assertThat(excludedCount).isEqualTo(1)

        val parsedFiles = getParsedFilePaths()
        assertThat(parsedFiles).containsExactlyInAnyOrder("src/Main.kt")
        assertThat(parsedFiles).doesNotContain("src/App.java")
    }

    @Test
    fun `should not exclude files when gitignore is disabled`() {
        // Arrange
        val gitignoreFile = File(rootDir, ".gitignore")
        gitignoreFile.writeText("*.java")

        val srcDir = File(rootDir, "src")
        srcDir.mkdirs()
        File(srcDir, "Main.kt").writeText("fun main() {}")
        File(srcDir, "Debug.java").writeText("class Debug {}")

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
        assertThat(excludedCount).isEqualTo(0)

        val parsedFiles = getParsedFilePaths()
        assertThat(parsedFiles).containsExactlyInAnyOrder("src/Main.kt", "src/Debug.java")
    }

    @Test
    fun `should exclude files matching nested gitignore patterns`() {
        // Arrange
        val rootGitignore = File(rootDir, ".gitignore")
        rootGitignore.writeText("*.java")

        val srcDir = File(rootDir, "src")
        srcDir.mkdirs()
        val srcGitignore = File(srcDir, ".gitignore")
        srcGitignore.writeText("*.tmp")

        File(rootDir, "readme.md").writeText("# README")
        File(srcDir, "Main.kt").writeText("fun main() {}")
        File(srcDir, "Debug.java").writeText("class Debug {}")
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
        assertThat(excludedCount).isEqualTo(2)

        val parsedFiles = getParsedFilePaths()
        assertThat(parsedFiles).containsExactly("src/Main.kt")
        assertThat(parsedFiles).doesNotContain("src/Debug.java")
        assertThat(parsedFiles).doesNotContain("src/temp.tmp")
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

        File(srcDir, "Main.kt").writeText("fun main() {}")
        File(srcDir, "debug.log").writeText("log")
        File(testDir, "Test.kt").writeText("test")

        // Act
        val scanner = ProjectScanner(
            root = rootDir,
            projectBuilder = projectBuilder,
            excludePatterns = listOf("test/.*"),
            includeExtensions = listOf(),
            useGitignore = true
        )
        scanner.traverseInputProject(verbose = false)

        // Assert
        val (gitignoreExcluded, _) = scanner.getGitIgnoreStatistics()
        assertThat(gitignoreExcluded).isEqualTo(1)

        val parsedFiles = getParsedFilePaths()
        assertThat(parsedFiles).containsExactly("src/Main.kt")
        assertThat(parsedFiles).doesNotContain("src/debug.log")
        assertThat(parsedFiles).doesNotContain("src/test/Test.kt")
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
        assertThat(excludedCount).isEqualTo(2)
        assertThat(gitignoreFiles).hasSize(2)
        assertThat(gitignoreFiles).containsExactlyInAnyOrder(
            ".gitignore",
            "src/.gitignore"
        )

        val parsedFiles = getParsedFilePaths()
        assertThat(parsedFiles).containsExactly("src/Main.kt")
        assertThat(parsedFiles).doesNotContain("src/debug.log", "src/temp.tmp")
    }

    @Test
    fun `should return empty statistics when gitignore is disabled`() {
        // Arrange
        val gitignoreFile = File(rootDir, ".gitignore")
        gitignoreFile.writeText("*.kt")

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
        val parsedFiles = getParsedFilePaths()
        assertThat(parsedFiles).containsExactlyInAnyOrder("src/Main.kt", "src/App.java")
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
            *.java
            !Important.java
            """.trimIndent()
        )

        val srcDir = File(rootDir, "src")
        srcDir.mkdirs()
        File(srcDir, "Main.kt").writeText("fun main() {}")
        File(srcDir, "Debug.java").writeText("class Debug {}")
        File(srcDir, "Important.java").writeText("class Important {}")

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
        assertThat(excludedCount).isEqualTo(1)

        val parsedFiles = getParsedFilePaths()
        assertThat(parsedFiles).containsExactlyInAnyOrder("src/Main.kt", "src/Important.java")
        assertThat(parsedFiles).doesNotContain("src/Debug.java")
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
            includeExtensions = listOf("kt", "java"),
            useGitignore = true
        )
        scanner.traverseInputProject(verbose = false)

        // Assert
        val (excludedCount, _) = scanner.getGitIgnoreStatistics()
        assertThat(excludedCount).isEqualTo(1)

        val parsedFiles = getParsedFilePaths()
        assertThat(parsedFiles).containsExactlyInAnyOrder("src/Main.kt", "src/App.java")
        assertThat(parsedFiles).doesNotContain("src/debug.log")
        assertThat(parsedFiles).doesNotContain("src/script.py")
    }
}
