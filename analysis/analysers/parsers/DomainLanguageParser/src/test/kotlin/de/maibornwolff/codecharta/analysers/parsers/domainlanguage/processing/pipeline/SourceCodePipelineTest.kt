package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.pipeline

import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.ExtractionWeights
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.Language
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.StopWordFilter
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.isExcluded
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.keywords.ResourceKeywords
import java.nio.file.Path
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class SourceCodePipelineTest {
    private val sourcePath: Path = Path.of("src", "Sample.kt")

    private val emptyFilter = StopWordFilter(emptyList(), emptySet())
    private val kotlinKeywordsFilter = StopWordFilter(listOf(ResourceKeywords("keywords/kotlin-keywords.txt")), emptySet())

    @Test
    fun `should process simple class through entire pipeline`() {
        // Arrange
        val pipeline =
            SourceCodePipeline(
                Language.KOTLIN,
                weights = ExtractionWeights(),
                ngrams = 1,
                stopWordFilter = emptyFilter
            )
        val sourceCode =
            """
            class UserProfile {
                val userName = "John"
            }
            """.trimIndent()

        // Act
        val result = pipeline.process(sourceCode, sourcePath)

        // Assert
        assertTrue(result.containsKey("user"))
        assertTrue(result.containsKey("profile"))
        assertTrue(result.containsKey("name"))
        assertTrue(result["user"]!! > 0)
    }

    @Test
    fun `should return empty map for blank source code`() {
        // Arrange
        val pipeline =
            SourceCodePipeline(
                Language.KOTLIN,
                stopWordFilter = emptyFilter
            )
        val sourceCode = "   "

        // Act
        val result = pipeline.process(sourceCode, sourcePath)

        // Assert
        assertTrue(result.isEmpty())
    }

    @Test
    fun `should return empty map for empty source code`() {
        // Arrange
        val pipeline =
            SourceCodePipeline(
                Language.KOTLIN,
                stopWordFilter = emptyFilter
            )
        val sourceCode = ""

        // Act
        val result = pipeline.process(sourceCode, sourcePath)

        // Assert
        assertTrue(result.isEmpty())
    }

    @Test
    fun `should generate bigrams with ngrams 2`() {
        // Arrange
        val pipeline =
            SourceCodePipeline(
                Language.KOTLIN,
                weights = ExtractionWeights(),
                ngrams = 2,
                stopWordFilter = emptyFilter
            )
        val sourceCode =
            """
            class UserProfile
            """.trimIndent()

        // Act
        val result = pipeline.process(sourceCode, sourcePath)

        // Assert
        assertTrue(result.containsKey("user"))
        assertTrue(result.containsKey("profile"))
        assertTrue(result.containsKey("user profile"))
    }

    @Test
    fun `should generate trigrams with ngrams 3`() {
        // Arrange
        val pipeline =
            SourceCodePipeline(
                Language.KOTLIN,
                weights = ExtractionWeights(),
                ngrams = 3,
                stopWordFilter = emptyFilter
            )
        val sourceCode =
            """
            class CustomerOrderProcessor
            """.trimIndent()

        // Act
        val result = pipeline.process(sourceCode, sourcePath)

        // Assert - SSR removes bigrams when trigram has equal frequency
        assertTrue(result.containsKey("customer"))
        assertTrue(result.containsKey("order"))
        assertTrue(result.containsKey("processor"))
        assertFalse(result.containsKey("customer order"))
        assertFalse(result.containsKey("order processor"))
        assertTrue(result.containsKey("customer order processor"))
    }

    @Test
    fun `should apply correct weights to different contexts`() {
        // Arrange
        val weights =
            ExtractionWeights(
                identifierWeight = 3,
                commentWeight = 2,
                stringWeight = 1
            )
        val pipeline =
            SourceCodePipeline(
                Language.KOTLIN,
                weights = weights,
                ngrams = 1,
                stopWordFilter = emptyFilter
            )
        val sourceCode =
            """
            // Process customer orders
            class OrderProcessor {
                fun process() {
                    println("process orders")
                }
            }
            """.trimIndent()

        // Act
        val result = pipeline.process(sourceCode, sourcePath)

        // Assert
        assertTrue(result.containsKey("process"))
        assertTrue(result.containsKey("order"))
        assertTrue(result.containsKey("orders"))

        assertEquals(6, result["process"])
        assertTrue(result.containsKey("processor"))
    }

    @Test
    fun `should aggregate duplicate identifiers`() {
        // Arrange
        val pipeline =
            SourceCodePipeline(
                Language.KOTLIN,
                weights = ExtractionWeights(),
                ngrams = 1,
                stopWordFilter = emptyFilter
            )
        val sourceCode =
            """
            class User {
                val userId: String
                val userName: String
                val userEmail: String
            }
            """.trimIndent()

        // Act
        val result = pipeline.process(sourceCode, sourcePath)

        // Assert
        assertTrue(result.containsKey("user"))
        assertEquals(12, result["user"])
    }

    @Test
    fun `should filter Kotlin language keywords`() {
        // Arrange
        val sourceCode =
            """
            class UserProfileData {
                val customerValue: String
                fun processObject() {}
            }
            """.trimIndent()

        // Act
        val unfiltered = pipelineWith(emptyFilter).process(sourceCode, sourcePath)
        val filtered = pipelineWith(kotlinKeywordsFilter).process(sourceCode, sourcePath)

        // Assert
        val removedWords = unfiltered.keys - filtered.keys
        assertTrue(removedWords.isNotEmpty(), "expected the Kotlin keyword filter to remove at least one word")
        assertTrue(removedWords.all { kotlinKeywordsFilter.isExcluded(it) })

        assertTrue(filtered.containsKey("user"))
        assertTrue(filtered.containsKey("profile"))
        assertTrue(filtered.containsKey("customer"))
        assertTrue(filtered.containsKey("process"))
    }

    private fun pipelineWith(stopWordFilter: StopWordFilter): SourceCodePipeline = SourceCodePipeline(
        Language.KOTLIN,
        weights = ExtractionWeights(),
        ngrams = 1,
        stopWordFilter = stopWordFilter
    )

    @Test
    fun `should process complex class with multiple members`() {
        // Arrange
        val pipeline =
            SourceCodePipeline(
                Language.KOTLIN,
                weights = ExtractionWeights(),
                ngrams = 1,
                stopWordFilter = emptyFilter
            )
        val sourceCode =
            """
            data class Customer(
                val customerId: String,
                val customerName: String,
                val customerEmail: String
            ) {
                fun validateCustomer(): Boolean {
                    return true
                }
            }
            """.trimIndent()

        // Act
        val result = pipeline.process(sourceCode, sourcePath)

        // Assert
        assertTrue(result.containsKey("customer"))
        assertTrue(result.containsKey("name"))
        assertTrue(result.containsKey("email"))
        assertTrue(result.containsKey("validate"))

        assertEquals(15, result["customer"])
    }

    @Test
    fun `should process enum class declaration`() {
        // Arrange
        val pipeline =
            SourceCodePipeline(
                Language.KOTLIN,
                weights = ExtractionWeights(),
                ngrams = 1,
                stopWordFilter = emptyFilter
            )
        val sourceCode =
            """
            enum class OrderStatus {
                PENDING,
                ACTIVE,
                COMPLETED
            }
            """.trimIndent()

        // Act
        val result = pipeline.process(sourceCode, sourcePath)

        // Assert
        assertTrue(result.containsKey("order"))
        assertTrue(result.containsKey("status"))
    }

    @Test
    fun `should extract words from comments and strings with correct weights`() {
        // Arrange
        val weights =
            ExtractionWeights(
                identifierWeight = 3,
                commentWeight = 2,
                stringWeight = 1
            )
        val pipeline =
            SourceCodePipeline(
                Language.KOTLIN,
                weights = weights,
                ngrams = 1,
                stopWordFilter = emptyFilter
            )
        val sourceCode =
            """
            // Calculate the total amount
            fun calculate() {
                val result = "total amount calculated"
            }
            """.trimIndent()

        // Act
        val result = pipeline.process(sourceCode, sourcePath)

        // Assert
        assertTrue(result.containsKey("calculate"))
        assertTrue(result.containsKey("total"))
        assertTrue(result.containsKey("amount"))

        assertEquals(5, result["calculate"])

        assertEquals(3, result["total"])
    }

    @Test
    fun `should handle interface declarations`() {
        // Arrange
        val pipeline =
            SourceCodePipeline(
                Language.KOTLIN,
                weights = ExtractionWeights(),
                ngrams = 1,
                stopWordFilter = emptyFilter
            )
        val sourceCode =
            """
            interface Drawable {
                fun draw()
                fun render()
            }
            """.trimIndent()

        // Act
        val result = pipeline.process(sourceCode, sourcePath)

        // Assert
        assertTrue(result.containsKey("drawable"))
        assertTrue(result.containsKey("draw"))
        assertTrue(result.containsKey("render"))
    }

    @Test
    fun `should handle object declarations`() {
        // Arrange
        val pipeline =
            SourceCodePipeline(
                Language.KOTLIN,
                weights = ExtractionWeights(),
                ngrams = 1,
                stopWordFilter = emptyFilter
            )
        val sourceCode =
            """
            object Singleton {
                val instance = "singleton"
            }
            """.trimIndent()

        // Act
        val result = pipeline.process(sourceCode, sourcePath)

        // Assert
        assertTrue(result.containsKey("singleton"))
        assertTrue(result.containsKey("instance"))
    }

    @Test
    fun `should process nested classes`() {
        // Arrange
        val pipeline =
            SourceCodePipeline(
                Language.KOTLIN,
                weights = ExtractionWeights(),
                ngrams = 1,
                stopWordFilter = emptyFilter
            )
        val sourceCode =
            """
            class Outer {
                class Inner {
                    val innerProperty = "test"
                }
                val outerProperty = "test"
            }
            """.trimIndent()

        // Act
        val result = pipeline.process(sourceCode, sourcePath)

        // Assert
        assertTrue(result.containsKey("outer"))
        assertTrue(result.containsKey("inner"))
        assertTrue(result.containsKey("property"))
    }

    @Test
    fun `should handle sealed class hierarchies`() {
        // Arrange
        val pipeline =
            SourceCodePipeline(
                Language.KOTLIN,
                weights = ExtractionWeights(),
                ngrams = 1,
                stopWordFilter = emptyFilter
            )
        val sourceCode =
            """
            sealed class Result {
                data class Success(val data: String) : Result()
                data class Error(val message: String) : Result()
            }
            """.trimIndent()

        // Act
        val result = pipeline.process(sourceCode, sourcePath)

        // Assert
        assertTrue(result.containsKey("result"))
        assertTrue(result.containsKey("success"))
        assertTrue(result.containsKey("error"))
        assertTrue(result.containsKey("data"))
        assertTrue(result.containsKey("message"))
    }

    @Test
    fun `should generate bigrams only for identifiers not comments`() {
        // Arrange
        val pipeline =
            SourceCodePipeline(
                Language.KOTLIN,
                weights = ExtractionWeights(),
                ngrams = 2,
                stopWordFilter = emptyFilter
            )
        val sourceCode =
            """
            // This is a comment with multiple words
            class UserProfile
            """.trimIndent()

        // Act
        val result = pipeline.process(sourceCode, sourcePath)

        // Assert
        assertTrue(result.containsKey("user profile"))

        assertTrue(!result.containsKey("comment with") || result["comment with"] == null)
    }

    @Test
    fun `should process typealias declarations`() {
        // Arrange
        val pipeline =
            SourceCodePipeline(
                Language.KOTLIN,
                weights = ExtractionWeights(),
                ngrams = 1,
                stopWordFilter = emptyFilter
            )
        val sourceCode =
            """
            typealias UserId = String
            typealias CustomerList = List<Customer>
            """.trimIndent()

        // Act
        val result = pipeline.process(sourceCode, sourcePath)

        // Assert
        assertTrue(result.containsKey("user"))
        assertTrue(result.containsKey("customer"))
        assertTrue(result.containsKey("list"))
    }
}
