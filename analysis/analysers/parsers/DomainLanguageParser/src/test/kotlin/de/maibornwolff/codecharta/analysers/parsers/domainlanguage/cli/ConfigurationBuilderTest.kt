package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.cli

import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.Framework
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.Language
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.keywords.ResourceKeywords
import org.junit.jupiter.api.io.TempDir
import java.nio.file.Path
import kotlin.io.path.writeText
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class ConfigurationBuilderTest {
    private val builder = ConfigurationBuilder()

    @Test
    fun `should build configuration with default values`() {
        // Arrange
        val parsedArgs = parsedArguments()

        // Act
        val config = builder.build(parsedArgs)

        // Assert
        assertEquals(3, config.weights.identifierWeight)
        assertEquals(2, config.weights.commentWeight)
        assertEquals(1, config.weights.stringWeight)
    }

    @Test
    fun `should build configuration with custom weights`() {
        // Arrange
        val parsedArgs = parsedArguments(identifierWeight = 10, commentWeight = 5, stringWeight = 3)

        // Act
        val config = builder.build(parsedArgs)

        // Assert
        assertEquals(10, config.weights.identifierWeight)
        assertEquals(5, config.weights.commentWeight)
        assertEquals(3, config.weights.stringWeight)
    }

    @Test
    fun `should include all supported file extensions`() {
        // Arrange
        val parsedArgs = parsedArguments()

        // Act
        val config = builder.build(parsedArgs)

        // Assert - should include all extensions from Language enum
        val expectedExtensions = Language.allExtensions()
        assertEquals(expectedExtensions, config.allowedExtensions)
    }

    @Test
    fun `should include all language keywords by default`() {
        // Arrange
        val parsedArgs = parsedArguments()

        // Act
        val config = builder.build(parsedArgs)

        // Assert (no framework keywords when package.json doesn't exist)
        // Should have 3 core language keywords + 1 technical stop words = 4
        assertEquals(4, config.languageKeywords.size)
        assertTrue(config.languageKeywords.all { it is ResourceKeywords })
        // Verify keywords are loaded correctly
        val allKeywords = config.languageKeywords.flatMap { it.getKeywords() }
        assertTrue(allKeywords.contains("class")) // Java/Kotlin keyword
        assertTrue(allKeywords.contains("fun")) // Kotlin keyword
        assertTrue(allKeywords.contains("interface")) // TypeScript keyword
    }

    @Test
    fun `should include technical stop words when not excluded`() {
        // Arrange
        val parsedArgs = parsedArguments()

        // Act
        val config = builder.build(parsedArgs)

        // Assert - 4 keywords providers (3 languages + 1 technical stop words)
        assertEquals(4, config.languageKeywords.size)
    }

    @Test
    fun `should exclude technical stop words when requested`() {
        // Arrange
        val parsedArgs = parsedArguments(excludeTechnicalStopWords = true)

        // Act
        val config = builder.build(parsedArgs)

        // Assert - only 3 core language keywords, no technical stop words
        assertEquals(3, config.languageKeywords.size)
    }

    @Test
    fun `should use minimal technical stop words when level is minimal`() {
        // Arrange
        val parsedArgs = parsedArguments(stopWordLevel = StopWordLevel.MINIMAL)

        // Act
        val config = builder.build(parsedArgs)

        // Assert - 4 keyword providers including minimal stop words
        assertEquals(4, config.languageKeywords.size)
    }

    @Test
    fun `should use moderate technical stop words when level is moderate`() {
        // Arrange
        val parsedArgs = parsedArguments()

        // Act
        val config = builder.build(parsedArgs)

        // Assert - 4 keyword providers including moderate stop words
        assertEquals(4, config.languageKeywords.size)
    }

    @Test
    fun `should use aggressive technical stop words when level is aggressive`() {
        // Arrange
        val parsedArgs = parsedArguments(stopWordLevel = StopWordLevel.AGGRESSIVE)

        // Act
        val config = builder.build(parsedArgs)

        // Assert - 4 keyword providers including aggressive stop words
        assertEquals(4, config.languageKeywords.size)
    }

    @Test
    fun `should transfer execution settings to configuration`() {
        // Arrange
        val parsedArgs = parsedArguments(limit = 50, bypassGitignore = true, excludeTests = true)

        // Act
        val config = builder.build(parsedArgs)

        // Assert - execution settings are now in the unified config
        assertEquals(50, config.limit)
        assertEquals(true, config.bypassGitignore)
        assertEquals(true, config.excludeTests)
    }

    @Test
    fun `should detect React framework and store in frameworksByPath`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val packageJson = tempDir.resolve("package.json")
        packageJson.writeText(
            """
            {
              "name": "react-project",
              "dependencies": {
                "react": "^18.0.0"
              }
            }
            """.trimIndent()
        )

        val parsedArgs = parsedArguments(directory = tempDir.toString())

        // Act
        val config = builder.build(parsedArgs)

        // Assert - framework keywords are now path-scoped, not in languageKeywords
        assertEquals(4, config.languageKeywords.size) // 3 core languages + 1 technical stop words
        assertTrue(config.frameworksByPath.isNotEmpty())
        assertTrue(config.frameworksByPath[tempDir]?.contains(Framework.REACT) == true)
        assertFalse(config.frameworksByPath[tempDir]?.contains(Framework.ANGULAR) == true)
    }

    @Test
    fun `should detect Angular framework and store in frameworksByPath`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val packageJson = tempDir.resolve("package.json")
        packageJson.writeText(
            """
            {
              "name": "angular-project",
              "dependencies": {
                "@angular/core": "^17.0.0"
              }
            }
            """.trimIndent()
        )

        val parsedArgs = parsedArguments(directory = tempDir.toString())

        // Act
        val config = builder.build(parsedArgs)

        // Assert - framework keywords are now path-scoped, not in languageKeywords
        assertEquals(4, config.languageKeywords.size) // 3 core languages + 1 technical stop words
        assertTrue(config.frameworksByPath.isNotEmpty())
        assertTrue(config.frameworksByPath[tempDir]?.contains(Framework.ANGULAR) == true)
        assertFalse(config.frameworksByPath[tempDir]?.contains(Framework.REACT) == true)
    }

    @Test
    fun `should detect both React and Angular frameworks in frameworksByPath`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val packageJson = tempDir.resolve("package.json")
        packageJson.writeText(
            """
            {
              "name": "multi-framework-project",
              "dependencies": {
                "react": "^18.0.0",
                "@angular/core": "^17.0.0"
              }
            }
            """.trimIndent()
        )

        val parsedArgs = parsedArguments(directory = tempDir.toString())

        // Act
        val config = builder.build(parsedArgs)

        // Assert - framework keywords are now path-scoped, not in languageKeywords
        assertEquals(4, config.languageKeywords.size) // 3 core languages + 1 technical stop words
        assertTrue(config.frameworksByPath.isNotEmpty())
        assertTrue(config.frameworksByPath[tempDir]?.contains(Framework.REACT) == true)
        assertTrue(config.frameworksByPath[tempDir]?.contains(Framework.ANGULAR) == true)
    }

    @Test
    fun `should have empty frameworksByPath when no framework is detected`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val packageJson = tempDir.resolve("package.json")
        packageJson.writeText(
            """
            {
              "name": "other-project",
              "dependencies": {
                "express": "^4.18.0"
              }
            }
            """.trimIndent()
        )

        val parsedArgs = parsedArguments(directory = tempDir.toString())

        // Act
        val config = builder.build(parsedArgs)

        // Assert - no frameworks detected, frameworksByPath should be empty
        assertEquals(4, config.languageKeywords.size) // 3 core languages + 1 technical stop words
        assertTrue(config.frameworksByPath.isEmpty())
    }

    @Test
    fun `should throw helpful error when directory is null`() {
        // Arrange
        val parsedArgs = parsedArguments(directory = null)

        // Act & Assert
        val exception =
            assertFailsWith<IllegalArgumentException> {
                builder.build(parsedArgs)
            }
        assertEquals("Please provide a directory with -d flag", exception.message)
    }

    private fun parsedArguments(
        directory: String? = "/path",
        limit: Int? = null,
        bypassGitignore: Boolean = false,
        excludeTests: Boolean = false,
        identifierWeight: Int = 3,
        commentWeight: Int = 2,
        stringWeight: Int = 1,
        excludeTechnicalStopWords: Boolean = false,
        stopWordLevel: StopWordLevel = StopWordLevel.MODERATE,
        ngrams: Int = 1,
        noTfidf: Boolean = false,
        sortBy: SortBy = SortBy.FREQUENCY,
        noSsr: Boolean = false
    ) = ParsedArguments(
        directory = directory,
        limit = limit,
        bypassGitignore = bypassGitignore,
        excludeTests = excludeTests,
        identifierWeight = identifierWeight,
        commentWeight = commentWeight,
        stringWeight = stringWeight,
        excludeTechnicalStopWords = excludeTechnicalStopWords,
        stopWordLevel = stopWordLevel,
        ngrams = ngrams,
        noTfidf = noTfidf,
        sortBy = sortBy,
        noSsr = noSsr
    )
}
