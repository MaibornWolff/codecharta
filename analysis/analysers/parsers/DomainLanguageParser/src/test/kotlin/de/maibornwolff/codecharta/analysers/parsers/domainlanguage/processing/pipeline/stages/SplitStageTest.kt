package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.pipeline.stages

import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.pipeline.ExtractionContext
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.pipeline.WeightedText
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class SplitStageTest {
    @Test
    fun `should split PascalCase words in comments`() {
        // Arrange
        val stage = SplitStage()
        val input =
            listOf(
                WeightedText("IllegalArgumentException", 2, ExtractionContext.COMMENT)
            )

        // Act
        val result = stage.split(input)

        // Assert
        assertEquals(1, result.size)
        val words = result.first().words.map { it.text }
        assertEquals(listOf("illegal", "argument", "exception"), words)
    }

    @Test
    fun `should split camelCase words in comments`() {
        // Arrange
        val stage = SplitStage()
        val input =
            listOf(
                WeightedText("getUserName", 2, ExtractionContext.COMMENT)
            )

        // Act
        val result = stage.split(input)

        // Assert
        assertEquals(1, result.size)
        val words = result.first().words.map { it.text }
        assertEquals(listOf("get", "user", "name"), words)
    }

    @Test
    fun `should split PascalCase words in strings`() {
        // Arrange
        val stage = SplitStage()
        val input =
            listOf(
                WeightedText("NullPointerException", 1, ExtractionContext.STRING)
            )

        // Act
        val result = stage.split(input)

        // Assert
        assertEquals(1, result.size)
        val words = result.first().words.map { it.text }
        assertEquals(listOf("null", "pointer", "exception"), words)
    }

    @Test
    fun `should split identifiers correctly`() {
        // Arrange
        val stage = SplitStage()
        val input =
            listOf(
                WeightedText("getUserProfile", 3, ExtractionContext.IDENTIFIER)
            )

        // Act
        val result = stage.split(input)

        // Assert
        assertEquals(1, result.size)
        val words = result.first().words.map { it.text }
        assertEquals(listOf("get", "user", "profile"), words)
    }

    @Test
    fun `should handle mixed content in comments`() {
        // Arrange
        val stage = SplitStage()
        val input =
            listOf(
                WeightedText("Throws IllegalArgumentException when invalid", 2, ExtractionContext.COMMENT)
            )

        // Act
        val result = stage.split(input)

        // Assert
        assertEquals(1, result.size)
        val words =
            result
                .first()
                .words
                .map { it.text }
                .toSet()
        assertEquals(setOf("throws", "illegal", "argument", "exception", "when", "invalid"), words)
    }

    @Test
    fun `should preserve weight and context after splitting`() {
        // Arrange
        val stage = SplitStage()
        val input =
            listOf(
                WeightedText("IllegalArgumentException", 2, ExtractionContext.COMMENT)
            )

        // Act
        val result = stage.split(input)

        // Assert
        assertEquals(1, result.size)
        val splitResult = result.first()
        assertEquals(2, splitResult.weight)
        assertEquals(ExtractionContext.COMMENT, splitResult.context)
        splitResult.words.forEach { word ->
            assertEquals(2, word.weight)
            assertEquals(ExtractionContext.COMMENT, word.context)
        }
    }

    @Test
    fun `should filter words shorter than minimum length`() {
        // Arrange
        val stage = SplitStage()
        val input =
            listOf(
                WeightedText("a to be or not", 2, ExtractionContext.COMMENT)
            )

        // Act
        val result = stage.split(input)

        // Assert
        assertEquals(1, result.size)
        val words = result.first().words.map { it.text }
        assertEquals(listOf("not"), words)
    }

    @Test
    fun `should handle empty input`() {
        // Arrange
        val stage = SplitStage()
        val input = emptyList<WeightedText>()

        // Act
        val result = stage.split(input)

        // Assert
        assertTrue(result.isEmpty())
    }

    @Test
    fun `should split customerOrder identifier`() {
        // Arrange
        val stage = SplitStage()
        val input = listOf(WeightedText("customerOrder", 3, ExtractionContext.IDENTIFIER))

        // Act
        val result = stage.split(input)

        // Assert
        val words = result.first().words.map { it.text }
        assertEquals(listOf("customer", "order"), words)
    }

    @Test
    fun `should split XMLParser identifier with acronym`() {
        // Arrange
        val stage = SplitStage()
        val input = listOf(WeightedText("XMLParser", 3, ExtractionContext.IDENTIFIER))

        // Act
        val result = stage.split(input)

        // Assert
        val words = result.first().words.map { it.text }
        assertEquals(listOf("xml", "parser"), words)
    }

    @Test
    fun `should split getHTTPResponse identifier with acronym`() {
        // Arrange
        val stage = SplitStage()
        val input = listOf(WeightedText("getHTTPResponse", 3, ExtractionContext.IDENTIFIER))

        // Act
        val result = stage.split(input)

        // Assert
        val words = result.first().words.map { it.text }
        assertEquals(listOf("get", "http", "response"), words)
    }

    @Test
    fun `should split HTTPServer identifier with acronym`() {
        // Arrange
        val stage = SplitStage()
        val input = listOf(WeightedText("HTTPServer", 3, ExtractionContext.IDENTIFIER))

        // Act
        val result = stage.split(input)

        // Assert
        val words = result.first().words.map { it.text }
        assertEquals(listOf("http", "server"), words)
    }

    @Test
    fun `should split snake_case identifier`() {
        // Arrange
        val stage = SplitStage()
        val input = listOf(WeightedText("user_profile_id", 3, ExtractionContext.IDENTIFIER))

        // Act
        val result = stage.split(input)

        // Assert
        val words = result.first().words.map { it.text }
        assertEquals(listOf("user", "profile", "id"), words)
    }

    @Test
    fun `should split SCREAMING_SNAKE_CASE identifier`() {
        // Arrange
        val stage = SplitStage()
        val input = listOf(WeightedText("CONSTANT_VALUE", 3, ExtractionContext.IDENTIFIER))

        // Act
        val result = stage.split(input)

        // Assert
        val words = result.first().words.map { it.text }
        assertEquals(listOf("constant", "value"), words)
    }

    @Test
    fun `should split XMLExtendedParser identifier with acronym`() {
        // Arrange
        val stage = SplitStage()
        val input = listOf(WeightedText("XMLExtendedParser", 3, ExtractionContext.IDENTIFIER))

        // Act
        val result = stage.split(input)

        // Assert
        val words = result.first().words.map { it.text }
        assertEquals(listOf("xml", "extended", "parser"), words)
    }

    @Test
    fun `should preserve alphanumeric terms like 3D in identifiers`() {
        // Arrange
        val stage = SplitStage()
        val input = listOf(WeightedText("Export3DMapButtonComponent", 3, ExtractionContext.IDENTIFIER))

        // Act
        val result = stage.split(input)

        // Assert
        val words = result.first().words.map { it.text }
        assertEquals(listOf("export", "3d", "map", "button", "component"), words)
    }

    @Test
    fun `should strip special characters from identifiers`() {
        // Arrange
        val stage = SplitStage()
        val input = listOf(WeightedText("maxTreeMapFiles\$", 3, ExtractionContext.IDENTIFIER))

        // Act
        val result = stage.split(input)

        // Assert
        val words = result.first().words.map { it.text }
        assertEquals(listOf("max", "tree", "map", "files"), words)
    }
}
