package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.analysis

import kotlin.math.log10
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class TfIdfCalculatorTest {
    @Test
    fun `should return empty map for empty input`() {
        // Arrange
        val calculator = TfIdfCalculator()
        val perFileFrequencies = emptyMap<String, Map<String, Int>>()

        // Act
        val result = calculator.calculate(perFileFrequencies)

        // Assert
        assertEquals(emptyMap(), result)
    }

    @Test
    fun `should return empty map for single file project`() {
        // Arrange - IDF is undefined for single document
        val calculator = TfIdfCalculator()
        val perFileFrequencies =
            mapOf(
                "Main.kt" to mapOf("account" to 10, "string" to 5)
            )

        // Act
        val result = calculator.calculate(perFileFrequencies)

        // Assert
        assertEquals(emptyMap(), result)
    }

    @Test
    fun `should calculate TF-IDF for term in one file`() {
        // Arrange
        val calculator = TfIdfCalculator()
        val perFileFrequencies =
            mapOf(
                "File1.kt" to mapOf("account" to 10),
                "File2.kt" to mapOf("string" to 5)
            )

        // Act
        val result = calculator.calculate(perFileFrequencies)

        // Assert
        val expectedIdf = log10(2.0 / 1.0)
        val expectedTfIdf = 10 * expectedIdf
        assertEquals(expectedTfIdf, result["account"]!!, 0.001)
    }

    @Test
    fun `should calculate zero TF-IDF for term in all files`() {
        // Arrange - term appears in all files, IDF = log10(2/2) = 0
        val calculator = TfIdfCalculator()
        val perFileFrequencies =
            mapOf(
                "File1.kt" to mapOf("string" to 10),
                "File2.kt" to mapOf("string" to 5)
            )

        // Act
        val result = calculator.calculate(perFileFrequencies)

        // Assert
        assertEquals(0.0, result["string"]!!, 0.001)
    }

    @Test
    fun `should sum TF across files for same term`() {
        // Arrange - "account" appears in 2 out of 3 files
        val calculator = TfIdfCalculator()
        val perFileFrequencies =
            mapOf(
                "File1.kt" to mapOf("account" to 10),
                "File2.kt" to mapOf("account" to 8, "string" to 5),
                "File3.kt" to mapOf("string" to 3)
            )

        // Act
        val result = calculator.calculate(perFileFrequencies)

        // Assert
        val expectedIdf = log10(3.0 / 2.0)
        val totalTf = 10 + 8
        val expectedTfIdf = totalTf * expectedIdf
        assertEquals(expectedTfIdf, result["account"]!!, 0.001)
    }

    @Test
    fun `should calculate higher TF-IDF for rare terms`() {
        // Arrange
        val calculator = TfIdfCalculator()
        val perFileFrequencies =
            mapOf(
                "File1.kt" to mapOf("domain" to 10, "string" to 5),
                "File2.kt" to mapOf("string" to 5),
                "File3.kt" to mapOf("string" to 5),
                "File4.kt" to mapOf("string" to 5),
                "File5.kt" to mapOf("string" to 5)
            )

        // Act
        val result = calculator.calculate(perFileFrequencies)

        // Assert
        assertTrue(result["domain"]!! > result["string"]!!)
        assertEquals(0.0, result["string"]!!, 0.001) // In all files, IDF = 0
    }

    @Test
    fun `should handle files with empty word counts`() {
        // Arrange
        val calculator = TfIdfCalculator()
        val perFileFrequencies =
            mapOf(
                "File1.kt" to mapOf("account" to 10),
                "File2.kt" to emptyMap()
            )

        // Act
        val result = calculator.calculate(perFileFrequencies)

        // Assert
        val expectedIdf = log10(2.0 / 1.0)
        val expectedTfIdf = 10 * expectedIdf
        assertEquals(expectedTfIdf, result["account"]!!, 0.001)
    }
}
