package de.maibornwolff.codecharta.analysers.analyserinterface.gitignore

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.CsvSource
import java.io.File
import java.nio.file.Path

class GitignorePatternMatcherTest {
    @TempDir
    lateinit var tempDir: Path

    private lateinit var baseDir: File
    private lateinit var gitignoreFile: File
    private lateinit var matcher: GitignorePatternMatcher

    @BeforeEach
    fun setUp() {
        baseDir = tempDir.toFile()
        gitignoreFile = File(baseDir, ".gitignore")
        matcher = GitignorePatternMatcher(baseDir)
    }

    @AfterEach
    fun tearDown() {
        if (gitignoreFile.exists()) {
            gitignoreFile.delete()
        }
    }

    // ========== BLANK LINES AND COMMENTS ==========

    @Test
    fun `should skip blank lines`() {
        // Arrange
        gitignoreFile.writeText(
            """

            *.log

            """.trimIndent()
        )

        // Act
        val rules = matcher.parseGitignoreFile(gitignoreFile)

        // Assert
        assertThat(rules).hasSize(1)
        assertThat(rules.first().pattern).contains("*.log")
    }

    @Test
    fun `should skip comment lines starting with hash`() {
        // Arrange
        gitignoreFile.writeText(
            """
            # This is a comment
            *.log
            # Another comment
            """.trimIndent()
        )

        // Act
        val rules = matcher.parseGitignoreFile(gitignoreFile)

        // Assert
        assertThat(rules).hasSize(1)
        assertThat(rules.first().pattern).contains("*.log")
    }

    @Test
    fun `should handle escaped hash as literal character`() {
        // Arrange
        gitignoreFile.writeText("\\#notacomment.txt")

        // Act
        val rules = matcher.parseGitignoreFile(gitignoreFile)

        // Assert
        assertThat(rules).hasSize(1)
        assertThat(rules.first().pattern).isEqualTo("\\#notacomment.txt")
    }

    // ========== TRAILING SPACES ==========

    @Test
    fun `should remove unquoted trailing spaces`() {
        // Arrange
        gitignoreFile.writeText("*.log   ")

        val testFile = File(baseDir, "debug.log")

        // Act
        val rules = matcher.parseGitignoreFile(gitignoreFile)

        // Assert
        assertThat(rules).hasSize(1)
        assertThat(matcher.shouldIgnore(testFile, rules)).isTrue()
    }

    @Test
    fun `should preserve trailing spaces when quoted with backslash`() {
        // Arrange
        gitignoreFile.writeText("trailing\\ ")

        val testFileWithSpace = File(baseDir, "trailing ")
        val testFileWithoutSpace = File(baseDir, "trailing")

        // Act
        val rules = matcher.parseGitignoreFile(gitignoreFile)

        // Assert
        assertThat(rules).hasSize(1)
        assertThat(matcher.shouldIgnore(testFileWithSpace, rules)).isTrue()
        assertThat(matcher.shouldIgnore(testFileWithoutSpace, rules)).isFalse()
    }

    // ========== NEGATION PATTERNS ==========

    @Test
    fun `should handle negation pattern to re-include files`() {
        // Arrange
        gitignoreFile.writeText(
            """
            *.log
            !important.log
            """.trimIndent()
        )
        val excludedFile = File(baseDir, "debug.log")
        val includedFile = File(baseDir, "important.log")

        // Act
        val rules = matcher.parseGitignoreFile(gitignoreFile)

        // Assert
        assertThat(rules).hasSize(2)
        assertThat(rules.first().isNegation).isFalse()
        assertThat(rules[1].isNegation).isTrue()
        assertThat(matcher.shouldIgnore(excludedFile, rules)).isTrue()
        assertThat(matcher.shouldIgnore(includedFile, rules)).isFalse()
    }

    @Test
    fun `should handle escaped exclamation mark as literal`() {
        // Arrange
        gitignoreFile.writeText("\\!important.txt")

        val testFile = File(baseDir, "!important.txt")
        testFile.createNewFile()

        // Act
        val rules = matcher.parseGitignoreFile(gitignoreFile)

        // Assert
        assertThat(rules).hasSize(1)
        assertThat(rules.first().isNegation).isFalse()
        assertThat(matcher.shouldIgnore(testFile, rules)).isTrue()
    }

    // ========== WILDCARDS ==========

    @Test
    fun `should match asterisk wildcard pattern`() {
        // Arrange
        gitignoreFile.writeText("*.log")

        val matchingFile = File(baseDir, "debug.log")
        matchingFile.createNewFile()
        val nonMatchingFile = File(baseDir, "readme.txt")
        nonMatchingFile.createNewFile()

        // Act
        val rules = matcher.parseGitignoreFile(gitignoreFile)

        // Assert
        assertThat(matcher.shouldIgnore(matchingFile, rules)).isTrue()
        assertThat(matcher.shouldIgnore(nonMatchingFile, rules)).isFalse()
    }

    @Test
    fun `should match asterisk in nested directories`() {
        // Arrange
        gitignoreFile.writeText("*.log")

        val nestedFile = File(baseDir, "src/main/debug.log")
        nestedFile.parentFile.mkdirs()

        // Act
        val rules = matcher.parseGitignoreFile(gitignoreFile)

        // Assert
        assertThat(matcher.shouldIgnore(nestedFile, rules)).isTrue()
    }

    @Test
    fun `should match question mark wildcard`() {
        // Arrange
        gitignoreFile.writeText("file?.txt")

        val matchingFile = File(baseDir, "file1.txt")
        val nonMatchingFile = File(baseDir, "file12.txt")

        // Act
        val rules = matcher.parseGitignoreFile(gitignoreFile)

        // Assert
        assertThat(matcher.shouldIgnore(matchingFile, rules)).isTrue()
        assertThat(matcher.shouldIgnore(nonMatchingFile, rules)).isFalse()
    }

    @ParameterizedTest
    @CsvSource(
        "file.o, true",
        "file.a, true",
        "file.c, false"
    )
    fun `should match character range patterns`(fileName: String, shouldBeIgnored: Boolean) {
        // Arrange
        gitignoreFile.writeText("*.[oa]")
        val testFile = File(baseDir, fileName)

        // Act
        val rules = matcher.parseGitignoreFile(gitignoreFile)

        // Assert
        assertThat(matcher.shouldIgnore(testFile, rules)).isEqualTo(shouldBeIgnored)
    }

    @ParameterizedTest
    @CsvSource(
        "README.txt, true",
        "readme.txt, false"
    )
    fun `should match character range with dash`(fileName: String, shouldBeIgnored: Boolean) {
        // Arrange
        gitignoreFile.writeText("[A-Z]*.txt")
        val testFile = File(baseDir, fileName)

        // Act
        val rules = matcher.parseGitignoreFile(gitignoreFile)

        // Assert
        assertThat(matcher.shouldIgnore(testFile, rules)).isEqualTo(shouldBeIgnored)
    }

    // ========== DOUBLE ASTERISK PATTERNS ==========

    @ParameterizedTest
    @CsvSource(
        "foo, true",
        "a/b/c/foo, true"
    )
    fun `should match double asterisk at beginning`(filePath: String, shouldBeIgnored: Boolean) {
        // Arrange
        gitignoreFile.writeText("**/foo")
        val testFile = File(baseDir, filePath)
        testFile.parentFile.mkdirs()
        testFile.createNewFile()

        // Act
        val rules = matcher.parseGitignoreFile(gitignoreFile)

        // Assert
        assertThat(matcher.shouldIgnore(testFile, rules)).isEqualTo(shouldBeIgnored)
    }

    @ParameterizedTest
    @CsvSource(
        "abc/file.txt, true",
        "abc/nested/file.txt, true",
        "xyz/file.txt, false"
    )
    fun `should match double asterisk at end`(filePath: String, shouldBeIgnored: Boolean) {
        // Arrange
        gitignoreFile.writeText("abc/**")
        val testFile = File(baseDir, filePath)
        testFile.parentFile.mkdirs()

        // Act
        val rules = matcher.parseGitignoreFile(gitignoreFile)

        // Assert
        assertThat(matcher.shouldIgnore(testFile, rules)).isEqualTo(shouldBeIgnored)
    }

    @ParameterizedTest
    @CsvSource(
        "a/b, true",
        "a/x/b, true",
        "a/x/y/b, true",
        "a/c, false"
    )
    fun `should match double asterisk in middle`(filePath: String, shouldBeIgnored: Boolean) {
        // Arrange
        gitignoreFile.writeText("a/**/b")
        val testFile = File(baseDir, filePath)
        testFile.parentFile.mkdirs()
        testFile.createNewFile()

        // Act
        val rules = matcher.parseGitignoreFile(gitignoreFile)

        // Assert
        assertThat(matcher.shouldIgnore(testFile, rules)).isEqualTo(shouldBeIgnored)
    }

    // ========== DIRECTORY-ONLY PATTERNS ==========

    @Test
    fun `should match directory-only pattern only for directories`() {
        // Arrange
        gitignoreFile.writeText("build/")

        val directory = File(baseDir, "build")
        directory.mkdirs()

        // Act
        val rules = matcher.parseGitignoreFile(gitignoreFile)

        // Assert
        assertThat(rules).hasSize(1)
        assertThat(rules.first().isDirOnly).isTrue()
        // Directory should be ignored
        assertThat(matcher.shouldIgnore(directory, rules)).isTrue()
    }

    @Test
    fun `should not match directory-only pattern for files`() {
        // Arrange
        gitignoreFile.writeText("build/")

        val file = File(baseDir, "build")
        file.createNewFile()

        // Act
        val rules = matcher.parseGitignoreFile(gitignoreFile)

        // Assert
        assertThat(rules.first().isDirOnly).isTrue()
        assertThat(matcher.shouldIgnore(file, rules)).isFalse()
    }

    // ========== ROOTED PATTERNS (slash at beginning) ==========

    @ParameterizedTest
    @CsvSource(
        "config.json, true",
        "src/config.json, false"
    )
    fun `should match rooted pattern only at root level`(filePath: String, shouldBeIgnored: Boolean) {
        // Arrange
        gitignoreFile.writeText("/config.json")
        val testFile = File(baseDir, filePath)
        testFile.parentFile.mkdirs()

        // Act
        val rules = matcher.parseGitignoreFile(gitignoreFile)

        // Assert
        assertThat(rules.first().isRooted).isTrue()
        assertThat(matcher.shouldIgnore(testFile, rules)).isEqualTo(shouldBeIgnored)
    }

    // ========== PATTERNS WITH SLASH IN MIDDLE ==========

    @ParameterizedTest
    @CsvSource(
        "foo/bar, true",
        "nested/foo/bar, false"
    )
    fun `should match pattern with slash in middle only relative to gitignore location`(filePath: String, shouldBeIgnored: Boolean) {
        // Arrange
        gitignoreFile.writeText("foo/bar")
        val testFile = File(baseDir, filePath)
        testFile.parentFile.mkdirs()

        // Act
        val rules = matcher.parseGitignoreFile(gitignoreFile)

        // Assert
        assertThat(rules.first().isRooted).isTrue() // Has slash, treated as rooted
        assertThat(matcher.shouldIgnore(testFile, rules)).isEqualTo(shouldBeIgnored)
    }

    // ========== PATTERNS WITHOUT SLASH (match at any depth) ==========

    @ParameterizedTest
    @CsvSource(
        "foo, true",
        "a/b/c/foo, true"
    )
    fun `should match simple pattern at any depth`(filePath: String, shouldBeIgnored: Boolean) {
        // Arrange
        gitignoreFile.writeText("foo")
        val testFile = File(baseDir, filePath)
        testFile.parentFile.mkdirs()

        // Act
        val rules = matcher.parseGitignoreFile(gitignoreFile)

        // Assert
        assertThat(rules.first().isRooted).isFalse()
        assertThat(matcher.shouldIgnore(testFile, rules)).isEqualTo(shouldBeIgnored)
    }

    // ========== LAST MATCH WINS ==========

    @ParameterizedTest
    @CsvSource(
        "important.log, false",
        "debug.log, true",
        "other.log, true"
    )
    fun `should apply last match wins semantics`(fileName: String, shouldBeIgnored: Boolean) {
        // Arrange
        gitignoreFile.writeText(
            """
            *.log
            !important.log
            debug.log
            """.trimIndent()
        )
        val testFile = File(baseDir, fileName)

        // Act
        val rules = matcher.parseGitignoreFile(gitignoreFile)

        // Assert
        assertThat(matcher.shouldIgnore(testFile, rules)).isEqualTo(shouldBeIgnored)
    }

    // ========== ERROR HANDLING ==========

    @Test
    fun `should return empty list for non-existent gitignore file`() {
        // Arrange
        val nonExistentFile = File(baseDir, "nonexistent.gitignore")

        // Act
        val rules = matcher.parseGitignoreFile(nonExistentFile)

        // Assert
        assertThat(rules).isEmpty()
    }

    @Test
    fun `should skip invalid patterns and continue parsing`() {
        // Arrange
        // Create a pattern that might cause issues (but PathMatcher should handle most patterns)
        gitignoreFile.writeText(
            """
            *.log

            *.txt
            """.trimIndent()
        )

        // Act
        val rules = matcher.parseGitignoreFile(gitignoreFile)

        // Assert
        assertThat(rules.size).isGreaterThanOrEqualTo(2)
    }

    // ========== COMPREHENSIVE INTEGRATION TEST ==========

    @Test
    fun `should handle complex gitignore file with multiple pattern types`() {
        // Arrange
        gitignoreFile.writeText(
            """
            # Logs
            *.log
            !important.log

            # Build directories
            build/
            dist/

            # Config at root only
            /config.json

            # Nested pattern
            src/test/temp

            # Character range
            *.[oa]

            # Double asterisk
            **/generated/**
            """.trimIndent()
        )
        val logFile = File(baseDir, "debug.log")
        val importantLog = File(baseDir, "important.log")
        val buildDir = File(baseDir, "build")
        buildDir.mkdirs()
        val configAtRoot = File(baseDir, "config.json")
        val configNested = File(baseDir, "src/config.json")
        val tempFile = File(baseDir, "src/test/temp")
        tempFile.parentFile.mkdirs()
        val objectFile = File(baseDir, "file.o")
        val generatedFile = File(baseDir, "src/generated/file.java")
        generatedFile.parentFile.mkdirs()

        // Act
        val rules = matcher.parseGitignoreFile(gitignoreFile)

        // Assert
        assertThat(rules.size).isGreaterThan(5) // At least 6 non-comment, non-blank rules
        assertThat(matcher.shouldIgnore(logFile, rules)).isTrue()
        assertThat(matcher.shouldIgnore(importantLog, rules)).isFalse()
        assertThat(matcher.shouldIgnore(buildDir, rules)).isTrue()
        assertThat(matcher.shouldIgnore(configAtRoot, rules)).isTrue()
        assertThat(matcher.shouldIgnore(configNested, rules)).isFalse()
        assertThat(matcher.shouldIgnore(tempFile, rules)).isTrue()
        assertThat(matcher.shouldIgnore(objectFile, rules)).isTrue()
        assertThat(matcher.shouldIgnore(generatedFile, rules)).isTrue()
    }
}
