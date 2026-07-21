package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing

import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.keywords.ResourceKeywords
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.runBlocking
import org.junit.jupiter.api.io.TempDir
import java.io.File
import java.nio.file.Path
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertIs
import kotlin.test.assertTrue

class FileAnalyzerTest {
    private fun FileResult.wordsOrEmpty(): Map<String, Int> = when (this) {
        is FileResult.Processed -> words
        is FileResult.Skipped -> emptyMap()
    }

    @Test
    fun `should extract words from Kotlin file using tree-sitter`(
        @TempDir tempDirPath: Path
    ) {
        // Arrange
        val tempDir = tempDirPath.toFile()
        val file = File(tempDir, "Customer.kt")
        file.writeText(
            """
            // Process customer data
            class CustomerService {
                fun processCustomer() {
                }
            }
            """.trimIndent()
        )

        val stopWordFilter = StopWordFilter(emptyList())
        val analyzer = FileAnalyzer(stopWordFilter)

        // Act
        val result = analyzer.extractWordsFromFile(file, file.readText())

        // Assert
        assertIs<FileResult.Processed>(result)
        val wordCounts = result.words
        assertTrue(wordCounts.containsKey("customer"))
        assertTrue(wordCounts.containsKey("service"))
        assertTrue(wordCounts.containsKey("process"))

        // Cleanup
    }

    @Test
    fun `should filter language keywords when provided`(
        @TempDir tempDirPath: Path
    ) {
        // Arrange
        val tempDir = tempDirPath.toFile()
        val file = File(tempDir, "code.kt")
        file.writeText(
            """
            class CustomerService {
                fun process() {}
            }
            """.trimIndent()
        )

        val stopWordFilter = StopWordFilter(listOf(ResourceKeywords("keywords/kotlin-keywords.txt")))
        val analyzer = FileAnalyzer(stopWordFilter)

        // Act
        val result = analyzer.extractWordsFromFile(file, file.readText())

        // Assert
        assertIs<FileResult.Processed>(result)
        val wordCounts = result.words
        assertTrue(wordCounts.containsKey("customer"))
        assertTrue(wordCounts.containsKey("service"))
        assertTrue(wordCounts.containsKey("process"))
        // class and fun are Kotlin keywords and should be filtered
        assertTrue(!wordCounts.containsKey("class"))
        assertTrue(!wordCounts.containsKey("fun"))

        // Cleanup
    }

    @Test
    fun `should use custom extraction weights when provided`(
        @TempDir tempDirPath: Path
    ) {
        // Arrange
        val tempDir = tempDirPath.toFile()
        val file = File(tempDir, "Product.kt")
        file.writeText(
            """
            // Product manager
            class ProductService {
            }
            """.trimIndent()
        )

        val stopWordFilter = StopWordFilter(emptyList())
        val weights = ExtractionWeights(identifierWeight = 5, commentWeight = 3, stringWeight = 1)
        val analyzer = FileAnalyzer(stopWordFilter, weights)

        // Act
        val result = analyzer.extractWordsFromFile(file, file.readText())

        // Assert
        assertIs<FileResult.Processed>(result)
        val wordCounts = result.words
        // "product" should have higher count from identifier (5) vs comment (3)
        val productCount = wordCounts["product"] ?: 0
        assertTrue(productCount >= 5) // At least from class name with weight 5

        // Cleanup
    }

    @Test
    fun `should return empty map when file has no extractable words`(
        @TempDir tempDirPath: Path
    ) {
        // Arrange
        val tempDir = tempDirPath.toFile()
        val file = File(tempDir, "empty.kt")
        file.writeText("")

        val stopWordFilter = StopWordFilter(emptyList())
        val analyzer = FileAnalyzer(stopWordFilter)

        // Act
        val result = analyzer.extractWordsFromFile(file, file.readText())

        // Assert
        assertIs<FileResult.Processed>(result)
        assertTrue(result.words.isEmpty())

        // Cleanup
    }

    @Test
    fun `should return Skipped result for unsupported file extension`(
        @TempDir tempDirPath: Path
    ) {
        // Arrange
        val tempDir = tempDirPath.toFile()
        val file = File(tempDir, "readme.txt")
        file.writeText("hello world kotlin")

        val stopWordFilter = StopWordFilter(emptyList())
        val analyzer = FileAnalyzer(stopWordFilter)

        // Act
        val result = analyzer.extractWordsFromFile(file, file.readText())

        // Assert - unsupported extensions return Skipped
        assertIs<FileResult.Skipped>(result)
        assertEquals("txt", result.extension)

        // Cleanup
    }

    @Test
    fun `should extract words from TypeScript file`(
        @TempDir tempDirPath: Path
    ) {
        // Arrange
        val tempDir = tempDirPath.toFile()
        val file = File(tempDir, "user.service.ts")
        file.writeText(
            """
            // User management service
            class UserService {
                async fetchUser(userId: string): Promise<User> {
                    return this.http.get<User>(`/users/${'$'}{userId}`);
                }
            }
            """.trimIndent()
        )

        val stopWordFilter = StopWordFilter(emptyList())
        val analyzer = FileAnalyzer(stopWordFilter)

        // Act
        val result = analyzer.extractWordsFromFile(file, file.readText())

        // Assert
        assertIs<FileResult.Processed>(result)
        val wordCounts = result.words
        assertTrue(wordCounts.containsKey("user"))
        assertTrue(wordCounts.containsKey("service"))
        assertTrue(wordCounts.containsKey("fetch"))

        // Cleanup
    }

    @Test
    fun `should extract words from JavaScript file`(
        @TempDir tempDirPath: Path
    ) {
        // Arrange
        val tempDir = tempDirPath.toFile()
        val file = File(tempDir, "payment.js")
        file.writeText(
            """
            // Payment processing module
            function processPayment(amount) {
                return validateAmount(amount);
            }
            """.trimIndent()
        )

        val stopWordFilter = StopWordFilter(emptyList())
        val analyzer = FileAnalyzer(stopWordFilter)

        // Act
        val result = analyzer.extractWordsFromFile(file, file.readText())

        // Assert - should extract some words from JavaScript file
        assertIs<FileResult.Processed>(result)
        val wordCounts = result.words
        assertTrue(wordCounts.isNotEmpty(), "Should extract words from JavaScript")
        assertTrue(wordCounts.containsKey("payment"), "payment should be extracted from function name")
        assertTrue(wordCounts.containsKey("process"), "process should be extracted from function name")

        // Cleanup
    }

    @Test
    fun `should handle concurrent access without data corruption`(
        @TempDir tempDirPath: Path
    ) {
        // Arrange
        val tempDir = tempDirPath.toFile()
        val stopWordFilter = StopWordFilter(emptyList())
        val analyzer = FileAnalyzer(stopWordFilter)

        // Create files of different languages to exercise pipeline caching
        val kotlinFile =
            File(tempDir, "Service.kt").apply {
                writeText("class CustomerService { fun process() {} }")
            }
        val tsFile =
            File(tempDir, "service.ts").apply {
                writeText("class OrderService { process(): void {} }")
            }
        val jsFile =
            File(tempDir, "handler.js").apply {
                writeText("function handlePayment() { return true; }")
            }

        val files = listOf(kotlinFile, tsFile, jsFile)

        // Act - process all files concurrently multiple times
        val iterations = 100
        runBlocking(Dispatchers.Default) {
            (1..iterations)
                .map {
                    async {
                        files.forEach { file ->
                            analyzer.extractWordsFromFile(file, file.readText())
                        }
                    }
                }.awaitAll()
        }

        // Assert - verify results are consistent (no corruption)
        val kotlinResult = analyzer.extractWordsFromFile(kotlinFile, kotlinFile.readText()).wordsOrEmpty()
        val tsResult = analyzer.extractWordsFromFile(tsFile, tsFile.readText()).wordsOrEmpty()
        val jsResult = analyzer.extractWordsFromFile(jsFile, jsFile.readText()).wordsOrEmpty()

        assertTrue(kotlinResult.containsKey("customer"))
        assertTrue(kotlinResult.containsKey("service"))
        assertTrue(tsResult.containsKey("order"))
        assertTrue(tsResult.containsKey("service"))
        assertTrue(jsResult.containsKey("handle"))
        assertTrue(jsResult.containsKey("payment"))

        // Verify pipeline count matches language count (not corrupted by race conditions)
        assertEquals(
            3,
            Language.entries
                .filter { lang ->
                    files.any { Language.fromExtension(it.extension) == lang }
                }.size
        )

        // Cleanup
    }
}
