package de.maibornwolff.codecharta.analysers.parsers.domainlanguage

import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.cli.AnalysisConfiguration
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.ExtractionWeights
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.Framework
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.keywords.ResourceKeywords
import org.junit.jupiter.api.io.TempDir
import java.io.File
import java.nio.file.Path
import kotlin.test.Test
import kotlin.test.assertTrue

class SourceAnalyzerFactoryTest {
    @Test
    fun `should create analyzer with minimal configuration`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val dir = tempDir.toFile()
        File(dir, "test.kt").writeText("class Test")
        val config = AnalysisConfiguration(allowedExtensions = listOf("kt"))

        // Act
        val analyzer = SourceAnalyzerFactory.create(config)
        val result = analyzer.analyze(dir.absolutePath)

        // Assert
        assertTrue(result.filePaths.isNotEmpty())
    }

    @Test
    fun `should create analyzer with full configuration`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val dir = tempDir.toFile()
        File(dir, "test.kt").writeText("class HelloWorld { fun greet() {} }")
        val config =
            AnalysisConfiguration(
                allowedExtensions = listOf("kt", "java", "ts"),
                bypassGitignore = true,
                excludeTests = true,
                languageKeywords =
                    listOf(
                        ResourceKeywords("keywords/kotlin-keywords.txt"),
                        ResourceKeywords("keywords/java-keywords.txt")
                    ),
                weights =
                    ExtractionWeights(
                        identifierWeight = 5,
                        commentWeight = 3,
                        stringWeight = 1
                    ),
                ngrams = 2,
                customStopWords = setOf("foo", "bar"),
                frameworksByPath = mapOf(tempDir to setOf(Framework.REACT)),
                enableSsr = false,
                limit = 100,
                outputFile = null,
                enableTfidf = true
            )

        // Act
        val analyzer = SourceAnalyzerFactory.create(config)
        val result = analyzer.analyze(dir.absolutePath)

        // Assert
        assertTrue(result.filePaths.isNotEmpty())
    }

    @Test
    fun `should create functional analyzer that can analyze files`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val dir = tempDir.toFile()
        File(dir, "test.kt").writeText("class HelloWorld { fun greet() {} }")
        val config = AnalysisConfiguration(allowedExtensions = listOf("kt"))
        val analyzer = SourceAnalyzerFactory.create(config)

        // Act
        val result = analyzer.analyze(dir.absolutePath)

        // Assert
        val words = result.wordsByPath.values.flatten().map { it.text }
        assertTrue(words.contains("hello"))
        assertTrue(words.contains("world"))
        assertTrue(words.contains("greet"))
    }
}
