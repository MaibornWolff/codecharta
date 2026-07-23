import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.output.DirectoryWordAggregator
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.output.WordFrequency
import kotlin.test.Test
import kotlin.test.assertEquals

class DirectoryWordAggregatorTest {
    @Test
    fun `should aggregate words from single file`() {
        // Arrange
        val fileWords =
            mapOf(
                "src/Main.kt" to
                    listOf(
                        WordFrequency("file", 10),
                        WordFrequency("word", 5)
                    )
            )

        // Act
        val result = DirectoryWordAggregator.aggregateDirectories(fileWords)

        // Assert
        assertEquals(3, result.size) // ., src, src/Main.kt
        assertEquals(
            listOf(WordFrequency("file", 10), WordFrequency("word", 5)),
            result["src/Main.kt"]
        )
        assertEquals(
            listOf(WordFrequency("file", 10), WordFrequency("word", 5)),
            result["src"]
        )
        assertEquals(
            listOf(WordFrequency("file", 10), WordFrequency("word", 5)),
            result["."]
        )
    }

    @Test
    fun `should aggregate words from multiple files in same directory`() {
        // Arrange
        val fileWords =
            mapOf(
                "src/Main.kt" to
                    listOf(
                        WordFrequency("file", 10),
                        WordFrequency("word", 5)
                    ),
                "src/Dlc.kt" to
                    listOf(
                        WordFrequency("word", 15),
                        WordFrequency("analyzer", 8)
                    )
            )

        // Act
        val result = DirectoryWordAggregator.aggregateDirectories(fileWords)

        // Assert
        val srcWords = result["src"]
        assertEquals(3, srcWords?.size)
        assertEquals("word", srcWords?.find { it.text == "word" }?.text)
        assertEquals(20, srcWords?.find { it.text == "word" }?.frequency) // 5 + 15
        assertEquals(10, srcWords?.find { it.text == "file" }?.frequency)
        assertEquals(8, srcWords?.find { it.text == "analyzer" }?.frequency)
    }

    @Test
    fun `should aggregate words from nested directories`() {
        // Arrange
        val fileWords =
            mapOf(
                "src/main/kotlin/Main.kt" to
                    listOf(
                        WordFrequency("file", 10),
                        WordFrequency("main", 5)
                    ),
                "src/test/kotlin/MainTest.kt" to
                    listOf(
                        WordFrequency("test", 8),
                        WordFrequency("main", 3)
                    )
            )

        // Act
        val result = DirectoryWordAggregator.aggregateDirectories(fileWords)

        // Assert
        val rootWords = result["."]
        assertEquals(3, rootWords?.size)
        assertEquals(10, rootWords?.find { it.text == "file" }?.frequency)
        assertEquals(8, rootWords?.find { it.text == "main" }?.frequency) // 5 + 3
        assertEquals(8, rootWords?.find { it.text == "test" }?.frequency)

        val srcWords = result["src"]
        assertEquals(3, srcWords?.size)

        val mainWords = result["src/main"]
        assertEquals(2, mainWords?.size)
        assertEquals(10, mainWords?.find { it.text == "file" }?.frequency)
        assertEquals(5, mainWords?.find { it.text == "main" }?.frequency)

        val testWords = result["src/test"]
        assertEquals(2, testWords?.size)
        assertEquals(8, testWords?.find { it.text == "test" }?.frequency)
        assertEquals(3, testWords?.find { it.text == "main" }?.frequency)
    }

    @Test
    fun `should handle empty input`() {
        // Arrange
        val fileWords = emptyMap<String, List<WordFrequency>>()

        // Act
        val result = DirectoryWordAggregator.aggregateDirectories(fileWords)

        // Assert
        assertEquals(0, result.size)
    }

    @Test
    fun `should not sort aggregated words - sorting is done by caller`() {
        // Arrange
        val fileWords =
            mapOf(
                "src/Main.kt" to
                    listOf(
                        WordFrequency("aaa", 10),
                        WordFrequency("bbb", 50),
                        WordFrequency("ccc", 30)
                    )
            )

        // Act
        val result = DirectoryWordAggregator.aggregateDirectories(fileWords)

        // Assert - aggregator returns unsorted results, caller (SourceAnalyzer) sorts
        val srcWords = result["src"]
        assertEquals(3, srcWords?.size)
        assertEquals(10, srcWords?.find { it.text == "aaa" }?.frequency)
        assertEquals(50, srcWords?.find { it.text == "bbb" }?.frequency)
        assertEquals(30, srcWords?.find { it.text == "ccc" }?.frequency)
    }
}
