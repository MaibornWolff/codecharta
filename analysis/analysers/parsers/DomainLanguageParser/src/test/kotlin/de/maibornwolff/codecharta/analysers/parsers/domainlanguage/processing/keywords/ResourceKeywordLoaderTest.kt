package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.keywords

import kotlin.test.Test
import kotlin.test.assertFailsWith
import kotlin.test.assertTrue

class ResourceKeywordLoaderTest {
    @Test
    fun `should load keywords from resource file`() {
        // Arrange
        val loader = ResourceKeywordLoader()

        // Act
        val keywords = loader.loadFromResource("keywords/kotlin-keywords.txt")

        // Assert
        assertTrue(keywords.contains("class"))
        assertTrue(keywords.contains("fun"))
        assertTrue(keywords.contains("val"))
        assertTrue(keywords.contains("var"))
    }

    @Test
    fun `should filter out comments and empty lines`() {
        // Arrange
        val loader = ResourceKeywordLoader()

        // Act
        val keywords = loader.loadFromResource("keywords/kotlin-keywords.txt")

        // Assert
        // Should not contain any lines starting with #
        keywords.forEach { keyword ->
            assertTrue(!keyword.startsWith("#"))
        }
    }

    @Test
    fun `should throw exception when resource file not found`() {
        // Arrange
        val loader = ResourceKeywordLoader()

        // Act & Assert
        assertFailsWith<IllegalArgumentException> {
            loader.loadFromResource("nonexistent/file.txt")
        }
    }

    @Test
    fun `should return set with all unique keywords`() {
        // Arrange
        val loader = ResourceKeywordLoader()

        // Act
        val kotlinKeywords = loader.loadFromResource("keywords/kotlin-keywords.txt")
        val tsKeywords = loader.loadFromResource("keywords/typescript-keywords.txt")
        val javaKeywords = loader.loadFromResource("keywords/java-keywords.txt")

        // Assert
        assertTrue(kotlinKeywords.size > 50) // Kotlin has many keywords
        assertTrue(tsKeywords.size > 40) // TypeScript has many keywords
        assertTrue(javaKeywords.size > 60) // Java has many keywords + common types
    }
}
