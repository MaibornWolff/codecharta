package de.maibornwolff.codecharta.analysers.parsers.domainlanguage

import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.cli.AnalysisConfiguration
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.cli.SortBy
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.input.FileScanner
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.output.DomainAnalysisResult
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.output.WordFrequency
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.FileAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.FileProcessingResult
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.FileProcessor
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.FileResult
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.PathScopedKeywordProvider
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.StopWordFilter
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.analysis.TfIdfCalculator
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.keywords.ResourceKeywords
import org.junit.jupiter.api.io.TempDir
import java.io.File
import java.nio.file.Path
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue

// The root aggregation node produced by DirectoryWordAggregator.
private const val ROOT_KEY = "."

private fun DomainAnalysisResult.allWords(): List<WordFrequency> = wordsByPath.values.flatten()

private fun DomainAnalysisResult.hasWord(text: String): Boolean = allWords().any { it.text == text }

private fun DomainAnalysisResult.rootWordOrder(): List<String> = (wordsByPath[ROOT_KEY] ?: emptyList()).map { it.text }

class SourceAnalyzerTest {
    @Test
    fun `should analyze directory and return domain words`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val dir = tempDir.toFile()
        File(dir, "file1.kt").writeText(
            """
            // hello world hello
            class Hello { fun world() {} }
            """.trimIndent()
        )
        File(dir, "file2.kt").writeText(
            """
            // world kotlin kotlin
            class World { fun kotlin() {} }
            """.trimIndent()
        )

        val analyzer = SourceAnalyzerFactory.create(AnalysisConfiguration(allowedExtensions = listOf("kt")))

        // Act
        val result = analyzer.analyze(dir.absolutePath)

        // Assert
        assertTrue(result.hasWord("hello"))
        assertTrue(result.hasWord("world"))
        assertTrue(result.hasWord("kotlin"))
    }

    @Test
    fun `should filter stop words from analysis`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val dir = tempDir.toFile()
        File(dir, "file1.kt").writeText(
            """
            // the hello and world the kotlin
            class Hello { fun world() {} fun kotlin() {} }
            """.trimIndent()
        )

        val analyzer = SourceAnalyzerFactory.create(AnalysisConfiguration(allowedExtensions = listOf("kt")))

        // Act
        val result = analyzer.analyze(dir.absolutePath)

        // Assert
        assertTrue(result.hasWord("hello"))
        assertTrue(result.hasWord("world"))
        assertTrue(result.hasWord("kotlin"))
        assertFalse(result.hasWord("the"))
        assertFalse(result.hasWord("and"))
    }

    @Test
    fun `should handle empty directory`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val dir = tempDir.toFile()
        val analyzer = SourceAnalyzerFactory.create(AnalysisConfiguration(allowedExtensions = listOf("kt")))

        // Act
        val result = analyzer.analyze(dir.absolutePath)

        // Assert
        assertTrue(result.filePaths.isEmpty())
        assertTrue(result.wordsByPath.isEmpty())
    }

    @Test
    fun `should sort results by frequency descending`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val dir = tempDir.toFile()
        // Use separate files to ensure clear frequency differences
        File(dir, "file1.kt").writeText("class Apple {}")
        File(dir, "file2.kt").writeText("class Apple {}")
        File(dir, "file3.kt").writeText("class Apple {}")
        File(dir, "file4.kt").writeText("class Banana {}")
        File(dir, "file5.kt").writeText("class Banana {}")
        File(dir, "file6.kt").writeText("class Cherry {}")

        val analyzer = SourceAnalyzerFactory.create(AnalysisConfiguration(allowedExtensions = listOf("kt")))

        // Act
        val result = analyzer.analyze(dir.absolutePath)

        // Assert - apple appears 3x, banana 2x, cherry 1x aggregated at the root
        val order = result.rootWordOrder()
        val appleIndex = order.indexOf("apple")
        val bananaIndex = order.indexOf("banana")
        val cherryIndex = order.indexOf("cherry")

        assertTrue(appleIndex >= 0, "apple should be present")
        assertTrue(bananaIndex >= 0, "banana should be present")
        assertTrue(cherryIndex >= 0, "cherry should be present")
        assertTrue(appleIndex < bananaIndex, "apple should come before banana")
        assertTrue(bananaIndex < cherryIndex, "banana should come before cherry")
    }

    @Test
    fun `should limit results to top X words when limit is specified`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val dir = tempDir.toFile()
        File(dir, "file1.kt").writeText(
            """
            // apple apple apple banana banana cherry
            class Apple { fun banana() {} fun cherry() {} }
            """.trimIndent()
        )

        val analyzer = SourceAnalyzerFactory.create(AnalysisConfiguration(allowedExtensions = listOf("kt"), limit = 2))

        // Act
        val result = analyzer.analyze(dir.absolutePath)

        // Assert - every node keeps at most `limit` words
        assertTrue(result.wordsByPath.values.all { it.size <= 2 })
        assertTrue(result.hasWord("apple"))
        assertTrue(result.hasWord("banana"))
        assertFalse(result.hasWord("cherry"))
    }

    @Test
    fun `should return all results when limit is null`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val dir = tempDir.toFile()
        File(dir, "file1.kt").writeText(
            """
            // apple apple apple banana banana cherry
            class Apple { fun banana() {} fun cherry() {} }
            """.trimIndent()
        )

        val analyzer = SourceAnalyzerFactory.create(AnalysisConfiguration(allowedExtensions = listOf("kt"), limit = null))

        // Act
        val result = analyzer.analyze(dir.absolutePath)

        // Assert
        assertTrue(result.hasWord("apple"))
        assertTrue(result.hasWord("banana"))
        assertTrue(result.hasWord("cherry"))
    }

    @Test
    fun `should filter language keywords when enabled`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val dir = tempDir.toFile()
        File(dir, "file1.ts").writeText(
            """
            // hello world kotlin
            function hello() { const world = 'kotlin'; if (true) {} }
            """.trimIndent()
        )

        val analyzer =
            SourceAnalyzerFactory.create(
                AnalysisConfiguration(
                    allowedExtensions = listOf("ts"),
                    languageKeywords = listOf(ResourceKeywords("keywords/typescript-keywords.txt"))
                )
            )

        // Act
        val result = analyzer.analyze(dir.absolutePath)

        // Assert
        assertTrue(result.hasWord("hello"))
        assertTrue(result.hasWord("world"))
        assertTrue(result.hasWord("kotlin"))
        assertFalse(result.hasWord("function"))
        assertFalse(result.hasWord("const"))
        assertFalse(result.hasWord("if"))
    }

    @Test
    fun `should not filter language keywords when not provided`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val dir = tempDir.toFile()
        File(dir, "file1.ts").writeText(
            """
            function hello() { const world = 1; }
            """.trimIndent()
        )

        val analyzer = SourceAnalyzerFactory.create(AnalysisConfiguration(allowedExtensions = listOf("ts")))

        // Act
        val result = analyzer.analyze(dir.absolutePath)

        // Assert - identifiers should be present (function/const are keywords but appear as identifiers)
        assertTrue(result.hasWord("hello"))
        assertTrue(result.hasWord("world"))
    }

    @Test
    fun `should filter multiple language keywords when provided`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val dir = tempDir.toFile()
        File(dir, "file1.kt").writeText(
            """
            // hello world kotlin
            class Hello {
                fun world(): String {
                    val kotlin = "test"
                    return kotlin
                }
            }
            """.trimIndent()
        )

        val analyzer =
            SourceAnalyzerFactory.create(
                AnalysisConfiguration(
                    allowedExtensions = listOf("kt"),
                    languageKeywords =
                        listOf(
                            ResourceKeywords("keywords/typescript-keywords.txt"),
                            ResourceKeywords("keywords/kotlin-keywords.txt")
                        )
                )
            )

        // Act
        val result = analyzer.analyze(dir.absolutePath)

        // Assert
        assertTrue(result.hasWord("hello"))
        assertTrue(result.hasWord("world"))
        assertTrue(result.hasWord("kotlin"))
        assertFalse(result.hasWord("fun"))
        assertFalse(result.hasWord("val"))
        assertFalse(result.hasWord("class"))
    }

    @Test
    fun `should extract domain words from Kotlin files with weighted analysis`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val dir = tempDir.toFile()
        File(dir, "UserProfile.kt").writeText(
            """
            // Process customer data
            class CustomerService {
                fun processCustomer() {
                }
            }
            """.trimIndent()
        )

        val analyzer = SourceAnalyzerFactory.create(AnalysisConfiguration(allowedExtensions = listOf("kt")))

        // Act
        val result = analyzer.analyze(dir.absolutePath)

        // Assert - weighted extraction pulls domain words from class name, comment and function name
        assertTrue(result.hasWord("customer"))
        assertTrue(result.hasWord("service"))
        assertTrue(result.hasWord("process"))
        assertTrue(result.hasWord("data"))
    }

    @Test
    fun `should return empty result when files are deleted between scan and read`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val dir = tempDir.toFile()
        val file = File(dir, "temporary.kt")
        file.writeText("class Temporary")

        // A FileProcessor that deletes the file before reading and reports no words
        val deletingProcessor =
            object : FileProcessor {
                override fun processFilesIndividually(
                    files: List<File>,
                    basePath: String,
                    contentReader: (File) -> String,
                    processor: (File, String) -> FileResult,
                    onFileProcessed: (() -> Unit)?
                ): FileProcessingResult {
                    files.forEach { it.delete() }
                    return FileProcessingResult(emptyMap(), emptyMap())
                }
            }

        val config = AnalysisConfiguration(allowedExtensions = listOf("kt"))
        val fileScanner = FileScanner(config.allowedExtensions)
        val stopWordFilter =
            StopWordFilter(
                languageKeywords = emptyList(),
                customStopWords = emptySet(),
                pathScopedKeywordProvider = PathScopedKeywordProvider(emptyMap())
            )
        val fileAnalyzer = FileAnalyzer(stopWordFilter, config.weights, config.ngrams, config.enableSsr)
        val analyzer =
            SourceAnalyzer(
                config = config,
                fileScanner = fileScanner,
                fileAnalyzer = fileAnalyzer,
                fileProcessor = deletingProcessor,
                tfIdfCalculator = TfIdfCalculator()
            )

        // Act - should not throw because the FileProcessor absorbs the deleted files
        val result = analyzer.analyze(dir.absolutePath)

        // Assert - empty result since files were deleted
        assertTrue(result.filePaths.isEmpty())
        assertTrue(result.wordsByPath.isEmpty())
    }

    @Test
    fun `should correctly merge word counts from multiple files processed concurrently`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val dir = tempDir.toFile()
        File(dir, "file1.kt").writeText(
            """
            // apple banana cherry
            class Apple { fun banana() {} fun cherry() {} }
            """.trimIndent()
        )
        File(dir, "file2.kt").writeText(
            """
            // apple banana date
            class Apple { fun banana() {} fun date() {} }
            """.trimIndent()
        )
        File(dir, "file3.kt").writeText(
            """
            // apple elderberry
            class Apple { fun elderberry() {} }
            """.trimIndent()
        )

        val analyzer = SourceAnalyzerFactory.create(AnalysisConfiguration(allowedExtensions = listOf("kt")))

        // Act
        val result = analyzer.analyze(dir.absolutePath)

        // Assert
        assertTrue(result.hasWord("apple"))
        assertTrue(result.hasWord("banana"))
        assertTrue(result.hasWord("cherry"))
        assertTrue(result.hasWord("date"))
        assertTrue(result.hasWord("elderberry"))
    }

    @Test
    fun `should produce deterministic results with concurrent processing`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val dir = tempDir.toFile()
        File(dir, "file1.kt").writeText(
            """
            // alpha beta gamma delta
            class Alpha { fun beta() {} fun gamma() {} fun delta() {} }
            """.trimIndent()
        )
        File(dir, "file2.kt").writeText(
            """
            // beta gamma delta epsilon
            class Beta { fun gamma() {} fun delta() {} fun epsilon() {} }
            """.trimIndent()
        )
        File(dir, "file3.kt").writeText(
            """
            // gamma delta epsilon zeta
            class Gamma { fun delta() {} fun epsilon() {} fun zeta() {} }
            """.trimIndent()
        )

        val analyzer = SourceAnalyzerFactory.create(AnalysisConfiguration(allowedExtensions = listOf("kt")))

        // Act - run analysis multiple times
        val result1 = analyzer.analyze(dir.absolutePath)
        val result2 = analyzer.analyze(dir.absolutePath)
        val result3 = analyzer.analyze(dir.absolutePath)

        // Assert - the word content per path is identical across runs
        assertEquals(result1.wordsByPath, result2.wordsByPath)
        assertEquals(result2.wordsByPath, result3.wordsByPath)
    }

    @Test
    fun `should filter technical stop words when moderate technical stop words are provided`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val dir = tempDir.toFile()
        File(dir, "Service.kt").writeText(
            """
            // Process customer service requests
            class CustomerService {
                fun processRequest() {
                    val manager = ServiceManager()
                    manager.handleRequest()
                }
            }
            """.trimIndent()
        )

        val analyzer =
            SourceAnalyzerFactory.create(
                AnalysisConfiguration(
                    allowedExtensions = listOf("kt"),
                    languageKeywords =
                        listOf(
                            ResourceKeywords("keywords/kotlin-keywords.txt"),
                            ResourceKeywords("keywords/technical-moderate.txt")
                        )
                )
            )

        // Act
        val result = analyzer.analyze(dir.absolutePath)

        // Assert - domain words remain, technical stop words are filtered
        assertTrue(result.hasWord("customer"))
        assertFalse(result.hasWord("service"))
        assertFalse(result.hasWord("manager"))
        assertFalse(result.hasWord("handler"))
    }

    @Test
    fun `should not filter technical words when technical filtering is disabled`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val dir = tempDir.toFile()
        File(dir, "Service.kt").writeText(
            """
            class CodeHelper {
                fun utilManager() {
                }
            }
            """.trimIndent()
        )

        val analyzer =
            SourceAnalyzerFactory.create(
                AnalysisConfiguration(
                    allowedExtensions = listOf("kt"),
                    languageKeywords = listOf(ResourceKeywords("keywords/kotlin-keywords.txt"))
                )
            )

        // Act
        val result = analyzer.analyze(dir.absolutePath)

        // Assert - technical words are present when not filtered
        assertTrue(result.hasWord("code"))
        assertTrue(result.hasWord("helper"))
        assertTrue(result.hasWord("util"))
        assertTrue(result.hasWord("manager"))
    }

    @Test
    fun `should include tfidf scores when enabled with multiple files`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val dir = tempDir.toFile()
        File(dir, "file1.kt").writeText("class Domain { fun common() {} }")
        File(dir, "file2.kt").writeText("class Other { fun common() {} }")
        File(dir, "file3.kt").writeText("class Another { fun common() {} }")

        val analyzer =
            SourceAnalyzerFactory.create(
                AnalysisConfiguration(
                    allowedExtensions = listOf("kt"),
                    enableTfidf = true
                )
            )

        // Act
        val result = analyzer.analyze(dir.absolutePath)

        // Assert
        assertTrue(result.allWords().any { it.tfidf != null })
    }

    @Test
    fun `should not include tfidf when disabled`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val dir = tempDir.toFile()
        File(dir, "file1.kt").writeText("class Domain { fun common() {} }")
        File(dir, "file2.kt").writeText("class Other { fun common() {} }")

        val analyzer =
            SourceAnalyzerFactory.create(
                AnalysisConfiguration(
                    allowedExtensions = listOf("kt"),
                    enableTfidf = false
                )
            )

        // Act
        val result = analyzer.analyze(dir.absolutePath)

        // Assert
        assertTrue(result.allWords().all { it.tfidf == null })
    }

    @Test
    fun `should not include tfidf for single file project`(
        @TempDir tempDir: Path
    ) {
        // Arrange - TF-IDF is undefined for a single file
        val dir = tempDir.toFile()
        File(dir, "file1.kt").writeText("class Domain { fun process() {} }")

        val analyzer =
            SourceAnalyzerFactory.create(
                AnalysisConfiguration(
                    allowedExtensions = listOf("kt"),
                    enableTfidf = true
                )
            )

        // Act
        val result = analyzer.analyze(dir.absolutePath)

        // Assert
        assertTrue(result.allWords().all { it.tfidf == null })
    }

    @Test
    fun `should sort by tfidf when sortBy is TFIDF`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val dir = tempDir.toFile()
        // "rare" appears in 1 file, "common" appears in all 5 files
        File(dir, "file1.kt").writeText("class Rare { fun common() {} }")
        File(dir, "file2.kt").writeText("class Other { fun common() {} }")
        File(dir, "file3.kt").writeText("class Third { fun common() {} }")
        File(dir, "file4.kt").writeText("class Fourth { fun common() {} }")
        File(dir, "file5.kt").writeText("class Fifth { fun common() {} }")

        val analyzer =
            SourceAnalyzerFactory.create(
                AnalysisConfiguration(
                    allowedExtensions = listOf("kt"),
                    enableTfidf = true,
                    sortBy = SortBy.TFIDF
                )
            )

        // Act
        val result = analyzer.analyze(dir.absolutePath)

        // Assert - "rare" should appear before "common" when sorted by TF-IDF at the root
        val order = result.rootWordOrder()
        val rareIndex = order.indexOf("rare")
        val commonIndex = order.indexOf("common")
        assertTrue(rareIndex >= 0, "rare should be present")
        assertTrue(commonIndex >= 0, "common should be present")
        assertTrue(rareIndex < commonIndex, "rare should come before common when sorted by TF-IDF")
    }
}
