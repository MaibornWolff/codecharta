package de.maibornwolff.codecharta.analysers.parsers.domainlanguage

import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.output.DomainAnalysisResult
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.output.WordFrequency
import kotlin.test.Test
import kotlin.test.assertEquals

class WordAnalyzerTest {
    @Test
    fun `should allow mock implementation for testing`() {
        // Arrange
        val mockResult =
            DomainAnalysisResult(
                filePaths = listOf("Mock.kt"),
                wordsByPath = mapOf("Mock.kt" to listOf(WordFrequency(text = "mock", frequency = 1)))
            )
        val mockAnalyzer =
            object : WordAnalyzer {
                override fun analyze(directoryPath: String): DomainAnalysisResult = mockResult
            }

        // Act
        val result = mockAnalyzer.analyze("/test/path")

        // Assert
        assertEquals(mockResult, result)
    }
}
