package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.cli

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNotEquals

class ParsedArgumentsTest {
    @Test
    fun `should create ParsedArguments with all properties`() {
        // Arrange & Act
        val args =
            ParsedArguments(
                directory = "/path/to/dir",
                limit = 100,
                bypassGitignore = true,
                excludeTests = false,
                identifierWeight = 5,
                commentWeight = 3,
                stringWeight = 2,
                noTechnicalStopWords = true,
                stopWordLevel = StopWordLevel.MODERATE,
                ngrams = 1
            )

        // Assert
        assertEquals("/path/to/dir", args.directory)
        assertEquals(100, args.limit)
        assertEquals(true, args.bypassGitignore)
        assertEquals(5, args.identifierWeight)
        assertEquals(3, args.commentWeight)
        assertEquals(2, args.stringWeight)
        assertEquals(true, args.noTechnicalStopWords)
    }

    @Test
    fun `should create ParsedArguments with null optional values`() {
        // Arrange & Act
        val args =
            ParsedArguments(
                directory = null,
                limit = null,
                bypassGitignore = false,
                excludeTests = false,
                identifierWeight = 3,
                commentWeight = 2,
                stringWeight = 1,
                noTechnicalStopWords = false,
                stopWordLevel = StopWordLevel.MODERATE,
                ngrams = 1
            )

        // Assert
        assertEquals(null, args.directory)
        assertEquals(null, args.limit)
    }

    @Test
    fun `should support data class equality`() {
        // Arrange
        val args1 =
            ParsedArguments(
                directory = "/path",
                limit = 50,
                bypassGitignore = false,
                excludeTests = false,
                identifierWeight = 3,
                commentWeight = 2,
                stringWeight = 1,
                noTechnicalStopWords = false,
                stopWordLevel = StopWordLevel.MODERATE,
                ngrams = 1
            )
        val args2 =
            ParsedArguments(
                directory = "/path",
                limit = 50,
                bypassGitignore = false,
                excludeTests = false,
                identifierWeight = 3,
                commentWeight = 2,
                stringWeight = 1,
                noTechnicalStopWords = false,
                stopWordLevel = StopWordLevel.MODERATE,
                ngrams = 1
            )

        // Act & Assert
        assertEquals(args1, args2)
    }

    @Test
    fun `should differentiate between different ParsedArguments`() {
        // Arrange
        val args1 =
            ParsedArguments(
                directory = "/path1",
                limit = 50,
                bypassGitignore = false,
                excludeTests = false,
                identifierWeight = 3,
                commentWeight = 2,
                stringWeight = 1,
                noTechnicalStopWords = false,
                stopWordLevel = StopWordLevel.MODERATE,
                ngrams = 1
            )
        val args2 =
            ParsedArguments(
                directory = "/path2",
                limit = 50,
                bypassGitignore = false,
                excludeTests = false,
                identifierWeight = 3,
                commentWeight = 2,
                stringWeight = 1,
                noTechnicalStopWords = false,
                stopWordLevel = StopWordLevel.MODERATE,
                ngrams = 1
            )

        // Act & Assert
        assertNotEquals(args1, args2)
    }

    @Test
    fun `should support data class copy`() {
        // Arrange
        val original =
            ParsedArguments(
                directory = "/original",
                limit = 50,
                bypassGitignore = false,
                excludeTests = false,
                identifierWeight = 3,
                commentWeight = 2,
                stringWeight = 1,
                noTechnicalStopWords = false,
                stopWordLevel = StopWordLevel.MODERATE,
                ngrams = 1
            )

        // Act
        val modified = original.copy(directory = "/modified", limit = 100)

        // Assert
        assertEquals("/modified", modified.directory)
        assertEquals(100, modified.limit)
        assertEquals(false, modified.bypassGitignore)
        assertEquals(3, modified.identifierWeight)
    }
}
