package de.maibornwolff.codecharta.analysers.analyserinterface.gitignore

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.PrintStream
import java.nio.file.Path

class GitignoreHandlerTest {
    @TempDir
    lateinit var tempDir: Path

    private lateinit var rootDir: File
    private val errContent = ByteArrayOutputStream()
    private val originalErr = System.err

    @BeforeEach
    fun setUp() {
        rootDir = tempDir.toFile()
        errContent.reset()
    }

    @AfterEach
    fun tearDown() {
        System.setErr(originalErr)
    }

    // ========== DISCOVERY TESTS ==========

    @Test
    fun `should discover root level gitignore file`() {
        // Arrange
        val gitignoreFile = File(rootDir, ".gitignore")
        gitignoreFile.writeText("*.log")

        // Act
        val handler = GitignoreHandler(rootDir)
        val (_, gitignoreFiles) = handler.getStatistics()

        // Assert
        assertThat(gitignoreFiles).containsExactly(".gitignore")
        assertThat(gitignoreFiles.size).isEqualTo(1)
        assertThat(gitignoreFiles).contains(".gitignore")
    }

    @Test
    fun `should discover multiple nested gitignore files`() {
        // Arrange
        val rootGitignore = File(rootDir, ".gitignore")
        rootGitignore.writeText("*.log")

        val srcDir = File(rootDir, "src")
        srcDir.mkdirs()
        val srcGitignore = File(srcDir, ".gitignore")
        srcGitignore.writeText("*.tmp")

        val testDir = File(srcDir, "test")
        testDir.mkdirs()
        val testGitignore = File(testDir, ".gitignore")
        testGitignore.writeText("*.bak")

        // Act
        val handler = GitignoreHandler(rootDir)
        val (_, gitignoreFiles) = handler.getStatistics()

        // Assert
        assertThat(gitignoreFiles.size).isEqualTo(3)
        assertThat(gitignoreFiles).containsExactlyInAnyOrder(
            ".gitignore",
            "src${File.separator}.gitignore",
            "src${File.separator}test${File.separator}.gitignore"
        )
    }

    @Test
    fun `should return false for hasRootLevelGitignore when no root gitignore exists`() {
        // Arrange
        val srcDir = File(rootDir, "src")
        srcDir.mkdirs()
        val srcGitignore = File(srcDir, ".gitignore")
        srcGitignore.writeText("*.tmp")

        // Act
        val handler = GitignoreHandler(rootDir)
        val (_, gitignoreFiles) = handler.getStatistics()

        // Assert
        assertThat(gitignoreFiles).doesNotContain(".gitignore")
        assertThat(gitignoreFiles.size).isEqualTo(1)
    }

    @Test
    fun `should handle empty gitignore file`() {
        // Arrange
        val gitignoreFile = File(rootDir, ".gitignore")
        gitignoreFile.writeText("")

        // Act
        val handler = GitignoreHandler(rootDir)
        val (_, gitignoreFiles) = handler.getStatistics()

        // Assert
        assertThat(gitignoreFiles.size).isEqualTo(0)
    }

    @Test
    fun `should handle gitignore file with only comments and blank lines`() {
        // Arrange
        val gitignoreFile = File(rootDir, ".gitignore")
        gitignoreFile.writeText(
            """
            # This is a comment

            # Another comment
            """.trimIndent()
        )

        // Act
        val handler = GitignoreHandler(rootDir)
        val (_, gitignoreFiles) = handler.getStatistics()

        // Assert
        assertThat(gitignoreFiles.size).isEqualTo(0)
    }

    // ========== BASIC EXCLUSION TESTS ==========

    @Test
    fun `should exclude file matching simple pattern`() {
        // Arrange
        val gitignoreFile = File(rootDir, ".gitignore")
        gitignoreFile.writeText("*.log")

        val handler = GitignoreHandler(rootDir)

        val logFile = File(rootDir, "debug.log")
        logFile.createNewFile()

        // Act
        val shouldExclude = handler.shouldExclude(logFile)

        // Assert
        assertThat(shouldExclude).isTrue()
    }

    @Test
    fun `should not exclude file not matching pattern`() {
        // Arrange
        val gitignoreFile = File(rootDir, ".gitignore")
        gitignoreFile.writeText("*.log")

        val handler = GitignoreHandler(rootDir)

        val txtFile = File(rootDir, "readme.txt")
        txtFile.createNewFile()

        // Act
        val shouldExclude = handler.shouldExclude(txtFile)

        // Assert
        assertThat(shouldExclude).isFalse()
    }

    @Test
    fun `should exclude file in nested directory`() {
        // Arrange
        val gitignoreFile = File(rootDir, ".gitignore")
        gitignoreFile.writeText("*.log")

        val handler = GitignoreHandler(rootDir)

        val srcDir = File(rootDir, "src")
        srcDir.mkdirs()
        val logFile = File(srcDir, "debug.log")

        // Act
        val shouldExclude = handler.shouldExclude(logFile)

        // Assert
        assertThat(shouldExclude).isTrue()
    }

    @Test
    fun `should handle negation pattern`() {
        // Arrange
        val gitignoreFile = File(rootDir, ".gitignore")
        gitignoreFile.writeText(
            """
            *.log
            !important.log
            """.trimIndent()
        )

        val handler = GitignoreHandler(rootDir)

        val debugLog = File(rootDir, "debug.log")
        val importantLog = File(rootDir, "important.log")

        // Act & Assert
        assertThat(handler.shouldExclude(debugLog)).isTrue()
        assertThat(handler.shouldExclude(importantLog)).isFalse()
    }

    // ========== NESTED GITIGNORE TESTS ==========

    @Test
    fun `should apply nested gitignore rules`() {
        // Arrange
        val rootGitignore = File(rootDir, ".gitignore")
        rootGitignore.writeText("*.log")

        val srcDir = File(rootDir, "src")
        srcDir.mkdirs()
        val srcGitignore = File(srcDir, ".gitignore")
        srcGitignore.writeText("*.tmp")

        val handler = GitignoreHandler(rootDir)

        val rootLog = File(rootDir, "debug.log")
        val srcLog = File(srcDir, "debug.log")
        val srcTmp = File(srcDir, "temp.tmp")
        val rootTmp = File(rootDir, "temp.tmp")

        // Act & Assert
        assertThat(handler.shouldExclude(rootLog)).isTrue()
        assertThat(handler.shouldExclude(srcLog)).isTrue()
        assertThat(handler.shouldExclude(srcTmp)).isTrue()
        assertThat(handler.shouldExclude(rootTmp)).isFalse()
    }

    @Test
    fun `should allow child gitignore to override parent with negation`() {
        // Arrange
        val rootGitignore = File(rootDir, ".gitignore")
        rootGitignore.writeText("*.log")

        val srcDir = File(rootDir, "src")
        srcDir.mkdirs()
        val srcGitignore = File(srcDir, ".gitignore")
        // Include both the exclusion and negation in child to properly override
        srcGitignore.writeText(
            """
            *.log
            !important.log
            """.trimIndent()
        )

        val handler = GitignoreHandler(rootDir)

        val rootLog = File(rootDir, "debug.log")
        val srcLog = File(srcDir, "debug.log")
        val srcImportant = File(srcDir, "important.log")

        // Act & Assert
        assertThat(handler.shouldExclude(rootLog)).isTrue()
        assertThat(handler.shouldExclude(srcLog)).isTrue()
        assertThat(handler.shouldExclude(srcImportant)).isFalse()
    }

    @Test
    fun `should apply rules from multiple levels in hierarchy`() {
        // Arrange
        val rootGitignore = File(rootDir, ".gitignore")
        rootGitignore.writeText("*.log")

        val srcDir = File(rootDir, "src")
        srcDir.mkdirs()
        val srcGitignore = File(srcDir, ".gitignore")
        srcGitignore.writeText("*.tmp")

        val testDir = File(srcDir, "test")
        testDir.mkdirs()
        val testGitignore = File(testDir, ".gitignore")
        testGitignore.writeText("*.bak")

        val handler = GitignoreHandler(rootDir)

        val testLog = File(testDir, "debug.log")
        val testTmp = File(testDir, "temp.tmp")
        val testBak = File(testDir, "backup.bak")
        val testTxt = File(testDir, "readme.txt")

        // Act & Assert
        assertThat(handler.shouldExclude(testLog)).isTrue() // From root
        assertThat(handler.shouldExclude(testTmp)).isTrue() // From src
        assertThat(handler.shouldExclude(testBak)).isTrue() // From test
        assertThat(handler.shouldExclude(testTxt)).isFalse() // Not matched
    }

    // ========== DIRECTORY-ONLY PATTERNS ==========

    @Test
    fun `should exclude only directories when pattern ends with slash`() {
        // Arrange
        val gitignoreFile = File(rootDir, ".gitignore")
        gitignoreFile.writeText("build/")

        val handler = GitignoreHandler(rootDir)

        val buildDir = File(rootDir, "build")
        buildDir.mkdirs()

        // Act & Assert
        assertThat(handler.shouldExclude(buildDir)).isTrue()
    }

    @Test
    fun `should exclude files inside directory when pattern ends with slash`() {
        // Arrange
        val gitignoreFile = File(rootDir, ".gitignore")
        gitignoreFile.writeText("build/")

        val handler = GitignoreHandler(rootDir)

        val buildDir = File(rootDir, "build")
        buildDir.mkdirs()
        val fileInBuild = File(buildDir, "output.txt")
        val nestedDir = File(buildDir, "nested")
        nestedDir.mkdirs()
        val fileInNested = File(nestedDir, "deep.log")

        // Act & Assert
        assertThat(handler.shouldExclude(buildDir)).isTrue()
        assertThat(handler.shouldExclude(fileInBuild)).isTrue()
        assertThat(handler.shouldExclude(fileInNested)).isTrue()
    }

    // ========== ROOTED PATTERNS ==========

    @Test
    fun `should apply rooted pattern only at gitignore level`() {
        // Arrange
        val gitignoreFile = File(rootDir, ".gitignore")
        gitignoreFile.writeText("/config.json")

        val handler = GitignoreHandler(rootDir)

        val configAtRoot = File(rootDir, "config.json")
        val srcDir = File(rootDir, "src")
        srcDir.mkdirs()
        val configInSrc = File(srcDir, "config.json")

        // Act & Assert
        assertThat(handler.shouldExclude(configAtRoot)).isTrue()
        assertThat(handler.shouldExclude(configInSrc)).isFalse()
    }

    @Test
    fun `should apply rooted pattern in nested gitignore`() {
        // Arrange
        val srcDir = File(rootDir, "src")
        srcDir.mkdirs()
        val srcGitignore = File(srcDir, ".gitignore")
        srcGitignore.writeText("/temp.txt")

        val handler = GitignoreHandler(rootDir)

        val tempInSrc = File(srcDir, "temp.txt")
        val testDir = File(srcDir, "test")
        testDir.mkdirs()
        val tempInTest = File(testDir, "temp.txt")

        // Act & Assert
        assertThat(handler.shouldExclude(tempInSrc)).isTrue()
        assertThat(handler.shouldExclude(tempInTest)).isFalse()
    }

    // ========== STATISTICS TESTS ==========

    @Test
    fun `should track excluded file count`() {
        // Arrange
        val gitignoreFile = File(rootDir, ".gitignore")
        gitignoreFile.writeText("*.log")

        val handler = GitignoreHandler(rootDir)

        val log1 = File(rootDir, "debug.log")
        val log2 = File(rootDir, "error.log")
        val txt = File(rootDir, "readme.txt")

        // Act
        handler.shouldExclude(log1)
        handler.shouldExclude(log2)
        handler.shouldExclude(txt)
        val (excludedCount, _) = handler.getStatistics()

        // Assert
        assertThat(excludedCount).isEqualTo(2)
    }

    @Test
    fun `should return statistics with file paths and count`() {
        // Arrange
        val rootGitignore = File(rootDir, ".gitignore")
        rootGitignore.writeText("*.log")

        val srcDir = File(rootDir, "src")
        srcDir.mkdirs()
        val srcGitignore = File(srcDir, ".gitignore")
        srcGitignore.writeText("*.tmp")

        val handler = GitignoreHandler(rootDir)

        val log1 = File(rootDir, "debug.log")
        val tmp1 = File(srcDir, "temp.tmp")

        handler.shouldExclude(log1)
        handler.shouldExclude(tmp1)

        // Act
        val (excludedCount, gitignorePaths) = handler.getStatistics()

        // Assert
        assertThat(excludedCount).isEqualTo(2)
        assertThat(gitignorePaths).hasSize(2)
        assertThat(gitignorePaths).containsExactlyInAnyOrder(
            ".gitignore",
            "src${File.separator}.gitignore"
        )
    }

    // ========== ERROR HANDLING TESTS ==========

    @Test
    fun `should handle file outside root directory`() {
        // Arrange
        val gitignoreFile = File(rootDir, ".gitignore")
        gitignoreFile.writeText("*.log")

        val handler = GitignoreHandler(rootDir)

        val outsideFile = File(tempDir.parent.toFile(), "outside.log")

        // Act
        val shouldExclude = handler.shouldExclude(outsideFile)

        // Assert
        assertThat(shouldExclude).isFalse()
    }

    @Test
    fun `should handle empty gitignore cache`() {
        // Arrange
        val handler = GitignoreHandler(rootDir)

        val file = File(rootDir, "test.txt")

        // Act
        val shouldExclude = handler.shouldExclude(file)
        val (excludedCount, gitignoreFiles) = handler.getStatistics()

        // Assert
        assertThat(shouldExclude).isFalse()
        assertThat(gitignoreFiles.size).isEqualTo(0)
        assertThat(excludedCount).isEqualTo(0)
    }

    @Test
    fun `should skip malformed patterns in gitignore file`() {
        // Arrange
        val malformedGitignoreFile = File(rootDir, ".gitignore")
        malformedGitignoreFile.writeText(
            """
            *.log
            [*.tmp
            test[.txt
            *.bak
            """.trimIndent()
        )

        System.setErr(PrintStream(errContent))

        // Act
        val handler = GitignoreHandler(rootDir)

        val logFile = File(rootDir, "debug.log")
        val tmpFile = File(rootDir, "test.tmp")
        val bakFile = File(rootDir, "backup.bak")

        val shouldExcludeLog = handler.shouldExclude(logFile)
        val shouldExcludeTmp = handler.shouldExclude(tmpFile)
        val shouldExcludeBak = handler.shouldExclude(bakFile)
        val (excludedCount, gitignoreFiles) = handler.getStatistics()

        // Assert
        assertThat(shouldExcludeLog).isTrue()
        assertThat(shouldExcludeBak).isTrue()
        assertThat(shouldExcludeTmp).isFalse()
        assertThat(excludedCount).isEqualTo(2)
        assertThat(gitignoreFiles).contains(".gitignore")

        assertThat(errContent.toString()).contains("Skipping invalid gitignore pattern '[*.tmp': Missing '] near index 8")
        assertThat(errContent.toString()).contains("Skipping invalid gitignore pattern 'test[.txt': Missing '] near index 11")

        // Clean up
        System.setErr(originalErr)
    }

    // ========== COMPREHENSIVE INTEGRATION TEST ==========

    @Test
    fun `should handle complex project structure with multiple gitignore files`() {
        // Arrange
        val rootGitignore = File(rootDir, ".gitignore")
        rootGitignore.writeText(
            """
            *.log
            !important.log
            /config.json
            """.trimIndent()
        )

        val srcDir = File(rootDir, "src")
        srcDir.mkdirs()
        val srcGitignore = File(srcDir, ".gitignore")
        srcGitignore.writeText(
            """
            *.tmp
            !keep.tmp
            """.trimIndent()
        )

        val testDir = File(srcDir, "test")
        testDir.mkdirs()
        val testGitignore = File(testDir, ".gitignore")
        testGitignore.writeText("*.bak")

        val handler = GitignoreHandler(rootDir)

        val rootLog = File(rootDir, "debug.log")
        val rootImportant = File(rootDir, "important.log")
        val rootConfig = File(rootDir, "config.json")
        val srcConfig = File(srcDir, "config.json")
        val srcTmp = File(srcDir, "temp.tmp")
        val srcKeep = File(srcDir, "keep.tmp")
        val testLog = File(testDir, "test.log")
        val testBak = File(testDir, "backup.bak")
        val testTxt = File(testDir, "readme.txt")

        // Act & Assert
        assertThat(handler.shouldExclude(rootLog)).isTrue() // Matched by *.log
        assertThat(handler.shouldExclude(rootImportant)).isFalse() // Negated
        assertThat(handler.shouldExclude(rootConfig)).isTrue() // Rooted pattern
        assertThat(handler.shouldExclude(srcConfig)).isFalse() // Rooted pattern doesn't apply here
        assertThat(handler.shouldExclude(srcTmp)).isTrue() // Matched by src/.gitignore
        assertThat(handler.shouldExclude(srcKeep)).isFalse() // Negated by src/.gitignore
        assertThat(handler.shouldExclude(testLog)).isTrue() // Matched by root *.log
        assertThat(handler.shouldExclude(testBak)).isTrue() // Matched by test/.gitignore
        assertThat(handler.shouldExclude(testTxt)).isFalse() // Not matched

        // Verify statistics
        val (excludedCount, gitignoreFiles) = handler.getStatistics()
        assertThat(gitignoreFiles.size).isEqualTo(3)
        assertThat(excludedCount).isEqualTo(5)
    }
}
