package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.keywords

import kotlin.test.Test
import kotlin.test.assertFailsWith
import kotlin.test.assertTrue

class ResourceKeywordsTest {
    @Test
    fun `should load keywords from resource file`() {
        // Arrange
        val keywords = ResourceKeywords("keywords/kotlin-keywords.txt")

        // Act
        val keywordSet = keywords.getKeywords()

        // Assert
        assertTrue(keywordSet.isNotEmpty())
        assertTrue(keywordSet.contains("class"))
        assertTrue(keywordSet.contains("fun"))
        assertTrue(keywordSet.contains("val"))
        assertTrue(keywordSet.contains("var"))
    }

    @Test
    fun `should cache keywords on subsequent calls`() {
        // Arrange
        val keywords = ResourceKeywords("keywords/java-keywords.txt")

        // Act
        val firstCall = keywords.getKeywords()
        val secondCall = keywords.getKeywords()

        // Assert
        assertTrue(firstCall === secondCall, "Keywords should be cached and return same instance")
    }

    @Test
    fun `should throw exception for non-existent resource`() {
        // Arrange
        val keywords = ResourceKeywords("keywords/nonexistent.txt")

        // Act & Assert
        assertFailsWith<IllegalArgumentException> {
            keywords.getKeywords()
        }
    }

    @Test
    fun `should load typescript keywords`() {
        // Arrange
        val keywords = ResourceKeywords("keywords/typescript-keywords.txt")

        // Act
        val keywordSet = keywords.getKeywords()

        // Assert
        assertTrue(keywordSet.contains("interface"))
        assertTrue(keywordSet.contains("type"))
        assertTrue(keywordSet.contains("async"))
    }

    @Test
    fun `should load javascript keywords without typescript-only keywords`() {
        // Arrange
        val jsKeywords = ResourceKeywords("keywords/javascript-keywords.txt")
        val tsKeywords = ResourceKeywords("keywords/typescript-keywords.txt")

        // Act
        val jsSet = jsKeywords.getKeywords()
        val tsSet = tsKeywords.getKeywords()

        // Assert - JS should not contain TypeScript-only keywords
        assertTrue(jsSet.contains("function"))
        assertTrue(jsSet.contains("const"))
        assertTrue(jsSet.contains("let"))

        val tsOnlyKeywords = listOf("interface", "type", "namespace", "enum", "abstract", "declare", "never", "unknown")
        tsOnlyKeywords.forEach { keyword ->
            assertTrue(tsSet.contains(keyword), "TypeScript should contain '$keyword'")
            assertTrue(!jsSet.contains(keyword), "JavaScript should NOT contain '$keyword'")
        }
    }

    @Test
    fun `should load technical stop words`() {
        // Arrange
        val minimalStopWords = ResourceKeywords("keywords/technical-minimal.txt")
        val moderateStopWords = ResourceKeywords("keywords/technical-moderate.txt")
        val aggressiveStopWords = ResourceKeywords("keywords/technical-aggressive.txt")

        // Act
        val minimalSet = minimalStopWords.getKeywords()
        val moderateSet = moderateStopWords.getKeywords()
        val aggressiveSet = aggressiveStopWords.getKeywords()

        // Assert
        assertTrue(minimalSet.isNotEmpty(), "Minimal stop words should not be empty")
        assertTrue(moderateSet.isNotEmpty(), "Moderate stop words should not be empty")
        assertTrue(aggressiveSet.isNotEmpty(), "Aggressive stop words should not be empty")
    }

    @Test
    fun `should load framework keywords`() {
        // Arrange & Act & Assert
        assertTrue(ResourceKeywords("keywords/angular-keywords.txt").getKeywords().isNotEmpty())
        assertTrue(ResourceKeywords("keywords/react-keywords.txt").getKeywords().isNotEmpty())
        assertTrue(ResourceKeywords("keywords/aspnet-keywords.txt").getKeywords().isNotEmpty())
        assertTrue(ResourceKeywords("keywords/entityframework-keywords.txt").getKeywords().isNotEmpty())
    }

    @Test
    fun `should lowercase every entry so it can match a word the pipeline emits`() {
        // Arrange - the Python list carries capitalized entries (False, None, True)
        val keywords = ResourceKeywords("keywords/python-keywords.txt")

        // Act
        val loaded = keywords.getKeywords()

        // Assert - SplitStage sanitizes every word to lower case, so a capitalized entry could never
        // match. Loading normalizes instead, which is what keeps those entries doing their job.
        assertTrue(loaded.none { it != it.lowercase() }, "keyword entries must be lowercased on load")
        assertTrue(loaded.contains("false"))
        assertTrue(loaded.contains("none"))
        assertTrue(loaded.contains("true"))
    }
}
