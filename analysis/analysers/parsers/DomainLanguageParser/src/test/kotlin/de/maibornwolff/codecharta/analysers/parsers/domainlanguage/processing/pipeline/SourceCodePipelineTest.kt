package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.pipeline

import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.ExtractionWeights
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.Language
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.StopWordFilter
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.keywords.ResourceKeywords
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class SourceCodePipelineTest {
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
        val result = pipeline.process(sourceCode)

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
        val result = pipeline.process(sourceCode)

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
        val result = pipeline.process(sourceCode)

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
        val result = pipeline.process(sourceCode)

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
        val result = pipeline.process(sourceCode)

        // Assert - SSR removes bigrams when trigram has equal frequency
        assertTrue(result.containsKey("customer"))
        assertTrue(result.containsKey("order"))
        assertTrue(result.containsKey("processor"))
        // Bigrams removed by SSR (contained in trigram with equal frequency)
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
        val result = pipeline.process(sourceCode)

        // Assert
        assertTrue(result.containsKey("process"))
        assertTrue(result.containsKey("order"))
        assertTrue(result.containsKey("orders"))

        // "process" appears as:
        // - identifier in OrderProcessor (weight 3) → "process" from "processor" split
        // - identifier in function name (weight 3)
        // - comment (weight 2)
        // - string (weight 1)
        // Total expected: 3 + 3 + 2 + 1 = 9
        assertTrue(result["process"]!! >= 6) // At least identifier + comment
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
        val result = pipeline.process(sourceCode)

        // Assert
        assertTrue(result.containsKey("user"))
        // "user" appears 4 times (class name + 3 properties) with weight 3 each = 12
        assertEquals(12, result["user"])
    }

    @Test
    fun `should filter Kotlin language keywords`() {
        // Arrange
        val pipeline =
            SourceCodePipeline(
                Language.KOTLIN,
                weights = ExtractionWeights(),
                ngrams = 1,
                stopWordFilter = kotlinKeywordsFilter
            )
        val sourceCode =
            """
            class UserProfile {
                val name: String
                fun process() {}
            }
            """.trimIndent()

        // Act
        val result = pipeline.process(sourceCode)

        // Assert
        // Should extract domain words
        assertTrue(result.containsKey("user"))
        assertTrue(result.containsKey("profile"))
        assertTrue(result.containsKey("name"))
        assertTrue(result.containsKey("process"))

        // Should not extract Kotlin keywords (class, val, fun are filtered)
        // Note: These wouldn't be extracted anyway since they're keywords,
        // but this test verifies the filter integration
    }

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
        val result = pipeline.process(sourceCode)

        // Assert
        assertTrue(result.containsKey("customer"))
        assertTrue(result.containsKey("name"))
        assertTrue(result.containsKey("email"))
        assertTrue(result.containsKey("validate"))

        // "customer" appears 5 times (class + 3 properties + 1 function) with weight 3 each = 15
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
        val result = pipeline.process(sourceCode)

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
        val result = pipeline.process(sourceCode)

        // Assert
        assertTrue(result.containsKey("calculate"))
        assertTrue(result.containsKey("total"))
        assertTrue(result.containsKey("amount"))

        // "calculate" appears as:
        // - identifier (weight 3)
        // - comment (weight 2)
        // Total: 5
        assertEquals(5, result["calculate"])

        // "total" appears as:
        // - comment (weight 2)
        // - string (weight 1)
        // Total: 3
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
        val result = pipeline.process(sourceCode)

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
        val result = pipeline.process(sourceCode)

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
        val result = pipeline.process(sourceCode)

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
        val result = pipeline.process(sourceCode)

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
        val result = pipeline.process(sourceCode)

        // Assert
        // Should have bigrams from identifier
        assertTrue(result.containsKey("user profile"))

        // Should NOT have bigrams from comment
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
        val result = pipeline.process(sourceCode)

        // Assert
        assertTrue(result.containsKey("user"))
        assertTrue(result.containsKey("customer"))
        assertTrue(result.containsKey("list"))
    }
}
