package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing

import kotlin.test.Test
import kotlin.test.assertEquals

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
