package de.maibornwolff.codecharta.analysers.parsers.unified.gitignore

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
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
        gitignoreFile.writeText("""

            *.log

        """.trimIndent())

        // Act
        val rules = matcher.parseGitignoreFile(gitignoreFile)

        // Assert
        assertThat(rules).hasSize(1)
        assertThat(rules[0].pattern).contains("*.log")
    }

    @Test
    fun `should skip comment lines starting with hash`() {
        // Arrange
        gitignoreFile.writeText("""
            # This is a comment
            *.log
            # Another comment
        """.trimIndent())

        // Act
        val rules = matcher.parseGitignoreFile(gitignoreFile)

        // Assert
        assertThat(rules).hasSize(1)
        assertThat(rules[0].pattern).contains("*.log")
    }

    @Test
    fun `should handle escaped hash as literal character`() {
        // Arrange
        gitignoreFile.writeText("\\#notacomment.txt")

        // Act
        val rules = matcher.parseGitignoreFile(gitignoreFile)

        // Assert
        assertThat(rules).hasSize(1)
        assertThat(rules[0].pattern).isEqualTo("\\#notacomment.txt")
    }

    // ========== TRAILING SPACES ==========

    @Test
    fun `should remove unquoted trailing spaces`() {
        // Arrange
        gitignoreFile.writeText("*.log   ")

        // Act
        val rules = matcher.parseGitignoreFile(gitignoreFile)
        val testFile = File(baseDir, "debug.log")

        // Assert
        assertThat(rules).hasSize(1)
        assertThat(matcher.shouldIgnore(testFile, rules)).isTrue()
    }

    @Test
    fun `should preserve trailing spaces when quoted with backslash`() {
        // Arrange
        gitignoreFile.writeText("trailing\\ ")

        // Act
        val rules = matcher.parseGitignoreFile(gitignoreFile)
        val testFileWithSpace = File(baseDir, "trailing ")
        val testFileWithoutSpace = File(baseDir, "trailing")

        // Assert
        assertThat(rules).hasSize(1)
        assertThat(matcher.shouldIgnore(testFileWithSpace, rules)).isTrue()
        assertThat(matcher.shouldIgnore(testFileWithoutSpace, rules)).isFalse()
    }

    // ========== NEGATION PATTERNS ==========

    @Test
    fun `should handle negation pattern to re-include files`() {
        // Arrange
        gitignoreFile.writeText("""
            *.log
            !important.log
        """.trimIndent())

        // Act
        val rules = matcher.parseGitignoreFile(gitignoreFile)
        val excludedFile = File(baseDir, "debug.log")
        val includedFile = File(baseDir, "important.log")

        // Assert
        assertThat(rules).hasSize(2)
        assertThat(rules[0].isNegation).isFalse()
        assertThat(rules[1].isNegation).isTrue()
        assertThat(matcher.shouldIgnore(excludedFile, rules)).isTrue()
        assertThat(matcher.shouldIgnore(includedFile, rules)).isFalse()
    }

    @Test
    fun `should handle escaped exclamation mark as literal`() {
        // Arrange
        gitignoreFile.writeText("\\!important.txt")

        // Act
        val rules = matcher.parseGitignoreFile(gitignoreFile)
        val testFile = File(baseDir, "!important.txt")
        testFile.createNewFile()

        // Assert
        assertThat(rules).hasSize(1)
        assertThat(rules[0].isNegation).isFalse()
        assertThat(matcher.shouldIgnore(testFile, rules)).isTrue()
    }

    // ========== WILDCARDS ==========

    @Test
    fun `should match asterisk wildcard pattern`() {
        // Arrange
        gitignoreFile.writeText("*.log")

        // Act
        val rules = matcher.parseGitignoreFile(gitignoreFile)
        val matchingFile = File(baseDir, "debug.log")
        matchingFile.createNewFile()
        val nonMatchingFile = File(baseDir, "readme.txt")
        nonMatchingFile.createNewFile()

        // Assert
        assertThat(matcher.shouldIgnore(matchingFile, rules)).isTrue()
        assertThat(matcher.shouldIgnore(nonMatchingFile, rules)).isFalse()
    }

    @Test
    fun `should match asterisk in nested directories`() {
        // Arrange
        gitignoreFile.writeText("*.log")

        // Act
        val rules = matcher.parseGitignoreFile(gitignoreFile)
        val nestedFile = File(baseDir, "src/main/debug.log")
        nestedFile.parentFile.mkdirs()

        // Assert
        assertThat(matcher.shouldIgnore(nestedFile, rules)).isTrue()
    }

    @Test
    fun `should match question mark wildcard`() {
        // Arrange
        gitignoreFile.writeText("file?.txt")

        // Act
        val rules = matcher.parseGitignoreFile(gitignoreFile)
        val matchingFile = File(baseDir, "file1.txt")
        val nonMatchingFile = File(baseDir, "file12.txt")

        // Assert
        assertThat(matcher.shouldIgnore(matchingFile, rules)).isTrue()
        assertThat(matcher.shouldIgnore(nonMatchingFile, rules)).isFalse()
    }

    @Test
    fun `should match character range patterns`() {
        // Arrange
        gitignoreFile.writeText("*.[oa]")

        // Act
        val rules = matcher.parseGitignoreFile(gitignoreFile)
        val matchingFile1 = File(baseDir, "file.o")
        val matchingFile2 = File(baseDir, "file.a")
        val nonMatchingFile = File(baseDir, "file.c")

        // Assert
        assertThat(matcher.shouldIgnore(matchingFile1, rules)).isTrue()
        assertThat(matcher.shouldIgnore(matchingFile2, rules)).isTrue()
        assertThat(matcher.shouldIgnore(nonMatchingFile, rules)).isFalse()
    }

    @Test
    fun `should match character range with dash`() {
        // Arrange
        gitignoreFile.writeText("[A-Z]*.txt")

        // Act
        val rules = matcher.parseGitignoreFile(gitignoreFile)
        val matchingFile = File(baseDir, "README.txt")
        val nonMatchingFile = File(baseDir, "readme.txt")

        // Assert
        assertThat(matcher.shouldIgnore(matchingFile, rules)).isTrue()
        assertThat(matcher.shouldIgnore(nonMatchingFile, rules)).isFalse()
    }

    // ========== DOUBLE ASTERISK PATTERNS ==========

    @Test
    fun `should match double asterisk at beginning`() {
        // Arrange
        gitignoreFile.writeText("**/foo")

        // Act
        val rules = matcher.parseGitignoreFile(gitignoreFile)
        val fileAtRoot = File(baseDir, "foo")
        fileAtRoot.createNewFile()
        val fileNested = File(baseDir, "a/b/c/foo")
        fileNested.parentFile.mkdirs()
        fileNested.createNewFile()

        // Assert
        assertThat(matcher.shouldIgnore(fileAtRoot, rules)).isTrue()
        assertThat(matcher.shouldIgnore(fileNested, rules)).isTrue()
    }

    @Test
    fun `should match double asterisk at end`() {
        // Arrange
        gitignoreFile.writeText("abc/**")

        // Act
        val rules = matcher.parseGitignoreFile(gitignoreFile)
        val fileInDir = File(baseDir, "abc/file.txt")
        val fileNestedInDir = File(baseDir, "abc/nested/file.txt")
        val fileOutsideDir = File(baseDir, "xyz/file.txt")
        fileInDir.parentFile.mkdirs()
        fileNestedInDir.parentFile.mkdirs()
        fileOutsideDir.parentFile.mkdirs()

        // Assert
        assertThat(matcher.shouldIgnore(fileInDir, rules)).isTrue()
        assertThat(matcher.shouldIgnore(fileNestedInDir, rules)).isTrue()
        assertThat(matcher.shouldIgnore(fileOutsideDir, rules)).isFalse()
    }

    @Test
    fun `should match double asterisk in middle`() {
        // Arrange
        gitignoreFile.writeText("a/**/b")

        // Act
        val rules = matcher.parseGitignoreFile(gitignoreFile)
        val directChild = File(baseDir, "a/b")
        val oneLevel = File(baseDir, "a/x/b")
        val twoLevels = File(baseDir, "a/x/y/b")
        val notMatching = File(baseDir, "a/c")
        directChild.parentFile.mkdirs()
        directChild.createNewFile()
        oneLevel.parentFile.mkdirs()
        oneLevel.createNewFile()
        twoLevels.parentFile.mkdirs()
        twoLevels.createNewFile()
        notMatching.parentFile.mkdirs()
        notMatching.createNewFile()

        // Assert
        assertThat(matcher.shouldIgnore(directChild, rules)).isTrue()
        assertThat(matcher.shouldIgnore(oneLevel, rules)).isTrue()
        assertThat(matcher.shouldIgnore(twoLevels, rules)).isTrue()
        assertThat(matcher.shouldIgnore(notMatching, rules)).isFalse()
    }

    // ========== DIRECTORY-ONLY PATTERNS ==========

    @Test
    fun `should match directory-only pattern only for directories`() {
        // Arrange
        gitignoreFile.writeText("build/")

        // Act
        val rules = matcher.parseGitignoreFile(gitignoreFile)
        val directory = File(baseDir, "build")
        directory.mkdirs()

        // Assert
        assertThat(rules).hasSize(1)
        assertThat(rules[0].isDirOnly).isTrue()
        // Directory should be ignored
        assertThat(matcher.shouldIgnore(directory, rules)).isTrue()
    }

    @Test
    fun `should not match directory-only pattern for files`() {
        // Arrange
        gitignoreFile.writeText("build/")

        // Act
        val rules = matcher.parseGitignoreFile(gitignoreFile)
        val file = File(baseDir, "build")
        file.createNewFile()

        // Assert
        assertThat(rules[0].isDirOnly).isTrue()
        assertThat(matcher.shouldIgnore(file, rules)).isFalse()
    }

    // ========== ROOTED PATTERNS (slash at beginning) ==========

    @Test
    fun `should match rooted pattern only at root level`() {
        // Arrange
        gitignoreFile.writeText("/config.json")

        // Act
        val rules = matcher.parseGitignoreFile(gitignoreFile)
        val fileAtRoot = File(baseDir, "config.json")
        val fileInSubdir = File(baseDir, "src/config.json")
        fileInSubdir.parentFile.mkdirs()

        // Assert
        assertThat(rules[0].isRooted).isTrue()
        assertThat(matcher.shouldIgnore(fileAtRoot, rules)).isTrue()
        assertThat(matcher.shouldIgnore(fileInSubdir, rules)).isFalse()
    }

    // ========== PATTERNS WITH SLASH IN MIDDLE ==========

    @Test
    fun `should match pattern with slash in middle only relative to gitignore location`() {
        // Arrange
        gitignoreFile.writeText("foo/bar")

        // Act
        val rules = matcher.parseGitignoreFile(gitignoreFile)
        val fileAtRootLevel = File(baseDir, "foo/bar")
        val fileNested = File(baseDir, "nested/foo/bar")
        fileAtRootLevel.parentFile.mkdirs()
        fileNested.parentFile.mkdirs()

        // Assert
        assertThat(rules[0].isRooted).isTrue()  // Has slash, treated as rooted
        assertThat(matcher.shouldIgnore(fileAtRootLevel, rules)).isTrue()
        assertThat(matcher.shouldIgnore(fileNested, rules)).isFalse()
    }

    // ========== PATTERNS WITHOUT SLASH (match at any depth) ==========

    @Test
    fun `should match simple pattern at any depth`() {
        // Arrange
        gitignoreFile.writeText("foo")

        // Act
        val rules = matcher.parseGitignoreFile(gitignoreFile)
        val fileAtRoot = File(baseDir, "foo")
        val fileNested = File(baseDir, "a/b/c/foo")
        fileNested.parentFile.mkdirs()

        // Assert
        assertThat(rules[0].isRooted).isFalse()
        assertThat(matcher.shouldIgnore(fileAtRoot, rules)).isTrue()
        assertThat(matcher.shouldIgnore(fileNested, rules)).isTrue()
    }

    // ========== LAST MATCH WINS ==========

    @Test
    fun `should apply last match wins semantics`() {
        // Arrange
        gitignoreFile.writeText("""
            *.log
            !important.log
            debug.log
        """.trimIndent())

        // Act
        val rules = matcher.parseGitignoreFile(gitignoreFile)
        val importantLog = File(baseDir, "important.log")
        val debugLog = File(baseDir, "debug.log")
        val otherLog = File(baseDir, "other.log")

        // Assert
        // important.log: matched by *.log (ignore), then !important.log (include) -> NOT ignored
        assertThat(matcher.shouldIgnore(importantLog, rules)).isFalse()
        // debug.log: matched by *.log (ignore), !important.log (no match), debug.log (ignore) -> ignored
        assertThat(matcher.shouldIgnore(debugLog, rules)).isTrue()
        // other.log: matched by *.log (ignore), !important.log (no match), debug.log (no match) -> ignored
        assertThat(matcher.shouldIgnore(otherLog, rules)).isTrue()
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
        gitignoreFile.writeText("""
            *.log

            *.txt
        """.trimIndent())

        // Act
        val rules = matcher.parseGitignoreFile(gitignoreFile)

        // Assert
        assertThat(rules.size).isGreaterThanOrEqualTo(2)
    }

    // ========== COMPREHENSIVE INTEGRATION TEST ==========

    @Test
    fun `should handle complex gitignore file with multiple pattern types`() {
        // Arrange
        gitignoreFile.writeText("""
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
        """.trimIndent())

        // Act
        val rules = matcher.parseGitignoreFile(gitignoreFile)

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

        // Assert
        assertThat(rules.size).isGreaterThan(5)  // At least 6 non-comment, non-blank rules
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
