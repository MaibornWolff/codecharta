package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.cli

import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.ExtractionWeights
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.keywords.ResourceKeywords
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith
import kotlin.test.assertNotEquals
import kotlin.test.assertNull
import kotlin.test.assertTrue

class AnalysisConfigurationTest {
    @Test
    fun `should create configuration with all properties`() {
        // Arrange
        val extensions = listOf("kt", "ts", "java")
        val keywords =
            listOf(
                ResourceKeywords("keywords/kotlin-keywords.txt"),
                ResourceKeywords("keywords/typescript-keywords.txt")
            )

        // Act
        val config =
            AnalysisConfiguration(
                allowedExtensions = extensions,
                languageKeywords = keywords,
                weights =
                    ExtractionWeights(
                        identifierWeight = 5,
                        commentWeight = 3,
                        stringWeight = 2
                    ),
                ngrams = 1,
                customStopWords = emptySet(),
                limit = 100,
                outputFile = "output.json",
                bypassGitignore = true,
                excludeTests = true
            )

        // Assert
        assertEquals(extensions, config.allowedExtensions)
        assertEquals(keywords, config.languageKeywords)
        assertEquals(5, config.weights.identifierWeight)
        assertEquals(3, config.weights.commentWeight)
        assertEquals(2, config.weights.stringWeight)
        assertEquals(100, config.limit)
        assertEquals("output.json", config.outputFile)
        assertEquals(true, config.bypassGitignore)
        assertEquals(true, config.excludeTests)
    }

    @Test
    fun `should create configuration with default values`() {
        // Arrange & Act
        val config = AnalysisConfiguration(allowedExtensions = listOf("kt"))

        // Assert
        assertTrue(config.languageKeywords.isEmpty())
        assertEquals(ExtractionWeights(), config.weights)
        assertEquals(1, config.ngrams)
        assertTrue(config.customStopWords.isEmpty())
        assertTrue(config.frameworksByPath.isEmpty())
        assertEquals(true, config.enableSsr)
        assertNull(config.limit)
        assertNull(config.outputFile)
        assertEquals(false, config.bypassGitignore)
        assertEquals(false, config.excludeTests)
        assertEquals(true, config.enableTfidf)
        assertEquals(SortBy.FREQUENCY, config.sortBy)
    }

    @Test
    fun `should reject empty allowedExtensions`() {
        // Arrange & Act & Assert
        assertFailsWith<IllegalArgumentException> {
            AnalysisConfiguration(allowedExtensions = emptyList())
        }.also { ex ->
            assertEquals("At least one file extension must be specified", ex.message)
        }
    }

    @Test
    fun `should reject ngrams less than 1`() {
        // Arrange & Act & Assert
        assertFailsWith<IllegalArgumentException> {
            AnalysisConfiguration(
                allowedExtensions = listOf("kt"),
                ngrams = 0
            )
        }.also { ex ->
            assertEquals("ngrams must be at least 1, got 0", ex.message)
        }
    }

    @Test
    fun `should reject blank extensions`() {
        // Arrange & Act & Assert
        assertFailsWith<IllegalArgumentException> {
            AnalysisConfiguration(allowedExtensions = listOf("kt", "  ", "ts"))
        }.also { ex ->
            assertEquals("Extensions cannot be blank", ex.message)
        }
    }

    @Test
    fun `should support data class equality`() {
        // Arrange
        val extensions = listOf("kt", "ts")
        val keywords = listOf(ResourceKeywords("keywords/kotlin-keywords.txt"))
        val config1 =
            AnalysisConfiguration(
                allowedExtensions = extensions,
                languageKeywords = keywords,
                weights = ExtractionWeights(),
                ngrams = 1,
                customStopWords = emptySet()
            )
        val config2 =
            AnalysisConfiguration(
                allowedExtensions = extensions,
                languageKeywords = keywords,
                weights = ExtractionWeights(),
                ngrams = 1,
                customStopWords = emptySet()
            )

        // Act & Assert
        assertEquals(config1, config2)
    }

    @Test
    fun `should differentiate between different configurations`() {
        // Arrange
        val config1 = AnalysisConfiguration(allowedExtensions = listOf("kt"))
        val config2 = AnalysisConfiguration(allowedExtensions = listOf("ts"))

        // Act & Assert
        assertNotEquals(config1, config2)
    }

    @Test
    fun `should support data class copy`() {
        // Arrange
        val original =
            AnalysisConfiguration(
                allowedExtensions = listOf("kt"),
                languageKeywords = listOf(ResourceKeywords("keywords/kotlin-keywords.txt")),
                weights = ExtractionWeights(),
                ngrams = 1,
                customStopWords = emptySet()
            )

        // Act
        val modified =
            original.copy(
                weights =
                    ExtractionWeights(
                        identifierWeight = 5,
                        commentWeight = 4,
                        stringWeight = 1
                    ),
                limit = 50
            )

        // Assert
        assertEquals(listOf("kt"), modified.allowedExtensions)
        assertEquals(5, modified.weights.identifierWeight)
        assertEquals(4, modified.weights.commentWeight)
        assertEquals(1, modified.weights.stringWeight)
        assertEquals(50, modified.limit)
    }
}
