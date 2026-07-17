package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith

class ExtractionWeightsTest {
    @Test
    fun `should create ExtractionWeights with default values`() {
        // Arrange & Act
        val weights = ExtractionWeights()

        // Assert
        assertEquals(3, weights.identifierWeight)
        assertEquals(2, weights.commentWeight)
        assertEquals(1, weights.stringWeight)
    }

    @Test
    fun `should create ExtractionWeights with custom values`() {
        // Arrange & Act
        val weights =
            ExtractionWeights(
                identifierWeight = 5,
                commentWeight = 3,
                stringWeight = 2
            )

        // Assert
        assertEquals(5, weights.identifierWeight)
        assertEquals(3, weights.commentWeight)
        assertEquals(2, weights.stringWeight)
    }

    @Test
    fun `should fail when identifier weight is zero`() {
        // Arrange & Act & Assert
        val exception =
            assertFailsWith<IllegalArgumentException> {
                ExtractionWeights(identifierWeight = 0)
            }
        assertEquals("Identifier weight must be positive, got 0", exception.message)
    }

    @Test
    fun `should fail when identifier weight is negative`() {
        // Arrange & Act & Assert
        val exception =
            assertFailsWith<IllegalArgumentException> {
                ExtractionWeights(identifierWeight = -1)
            }
        assertEquals("Identifier weight must be positive, got -1", exception.message)
    }

    @Test
    fun `should fail when comment weight is zero`() {
        // Arrange & Act & Assert
        val exception =
            assertFailsWith<IllegalArgumentException> {
                ExtractionWeights(commentWeight = 0)
            }
        assertEquals("Comment weight must be positive, got 0", exception.message)
    }

    @Test
    fun `should fail when comment weight is negative`() {
        // Arrange & Act & Assert
        val exception =
            assertFailsWith<IllegalArgumentException> {
                ExtractionWeights(commentWeight = -1)
            }
        assertEquals("Comment weight must be positive, got -1", exception.message)
    }

    @Test
    fun `should fail when string weight is zero`() {
        // Arrange & Act & Assert
        val exception =
            assertFailsWith<IllegalArgumentException> {
                ExtractionWeights(stringWeight = 0)
            }
        assertEquals("String weight must be positive, got 0", exception.message)
    }

    @Test
    fun `should fail when string weight is negative`() {
        // Arrange & Act & Assert
        val exception =
            assertFailsWith<IllegalArgumentException> {
                ExtractionWeights(stringWeight = -1)
            }
        assertEquals("String weight must be positive, got -1", exception.message)
    }

    @Test
    fun `should create ExtractionWeights with minimum valid values`() {
        // Arrange & Act
        val weights =
            ExtractionWeights(
                identifierWeight = 1,
                commentWeight = 1,
                stringWeight = 1
            )

        // Assert
        assertEquals(1, weights.identifierWeight)
        assertEquals(1, weights.commentWeight)
        assertEquals(1, weights.stringWeight)
    }

    @Test
    fun `should create ExtractionWeights with large values`() {
        // Arrange & Act
        val weights =
            ExtractionWeights(
                identifierWeight = 100,
                commentWeight = 50,
                stringWeight = 25
            )

        // Assert
        assertEquals(100, weights.identifierWeight)
        assertEquals(50, weights.commentWeight)
        assertEquals(25, weights.stringWeight)
    }
}
