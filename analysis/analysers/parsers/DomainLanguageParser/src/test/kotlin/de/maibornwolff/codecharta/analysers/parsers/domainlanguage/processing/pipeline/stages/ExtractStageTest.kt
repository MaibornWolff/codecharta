package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.pipeline.stages

import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.pipeline.ExtractionContext
import de.maibornwolff.treesitter.excavationsite.api.Language
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class ExtractStageTest {
    private val stage = ExtractStage(Language.KOTLIN)

    @Test
    fun `should return empty list for blank source code`() {
        // Arrange
        val sourceCode = "   "

        // Act
        val result = stage.extract(sourceCode)

        // Assert
        assertTrue(result.isEmpty())
    }

    @Test
    fun `should return empty list for empty source code`() {
        // Arrange
        val sourceCode = ""

        // Act
        val result = stage.extract(sourceCode)

        // Assert
        assertTrue(result.isEmpty())
    }

    @Test
    fun `should extract single-line comments`() {
        // Arrange
        val sourceCode =
            """
            // This is a comment
            // Another comment here
            """.trimIndent()

        // Act
        val result = stage.extract(sourceCode)

        // Assert
        val comments = result.filter { it.context == ExtractionContext.COMMENT }
        assertEquals(2, comments.size)
        assertTrue(comments.any { it.text.contains("This is a comment") })
        assertTrue(comments.any { it.text.contains("Another comment here") })
    }

    @Test
    fun `should extract multi-line comments`() {
        // Arrange
        val sourceCode =
            """
            /*
             * This is a multi-line comment
             * with multiple lines
             */
            fun test() {}
            """.trimIndent()

        // Act
        val result = stage.extract(sourceCode)

        // Assert
        val comments = result.filter { it.context == ExtractionContext.COMMENT }
        assertTrue(comments.isNotEmpty())
        val multiLineComment = comments.first()
        assertTrue(multiLineComment.text.contains("multi-line comment"))
    }

    @Test
    fun `should extract double-quoted strings`() {
        // Arrange
        val sourceCode =
            """
            val message = "Hello World"
            val greeting = "Welcome to Kotlin"
            """.trimIndent()

        // Act
        val result = stage.extract(sourceCode)

        // Assert
        val strings = result.filter { it.context == ExtractionContext.STRING }
        assertTrue(strings.any { it.text == "Hello World" })
        assertTrue(strings.any { it.text == "Welcome to Kotlin" })
    }

    @Test
    fun `should extract character literals`() {
        // Arrange
        val sourceCode =
            """
            val char = 'a'
            """.trimIndent()

        // Act
        val result = stage.extract(sourceCode)

        // Assert
        val identifiers = result.filter { it.context == ExtractionContext.IDENTIFIER }
        assertTrue(identifiers.any { it.text == "char" })
    }

    @Test
    fun `should extract triple-quoted strings`() {
        // Arrange
        val sourceCode =
            """
            val text = ${"\"\"\""}
                This is a triple-quoted string
                with multiple lines
            ${"\"\"\""}
            """.trimIndent()

        // Act
        val result = stage.extract(sourceCode)

        // Assert
        val strings = result.filter { it.context == ExtractionContext.STRING }
        assertTrue(strings.isNotEmpty())
        val tripleQuoted = strings.first()
        assertTrue(tripleQuoted.text.contains("triple-quoted string"))
    }

    @Test
    fun `should extract all string lengths`() {
        // Arrange
        val sourceCode =
            """
            val short = "ab"
            val long = "Hello"
            """.trimIndent()

        // Act
        val result = stage.extract(sourceCode)

        // Assert
        val strings = result.filter { it.context == ExtractionContext.STRING }
        assertTrue(strings.any { it.text == "Hello" })
        assertTrue(strings.any { it.text == "ab" })
    }

    @Test
    fun `should extract identifiers from class declaration`() {
        // Arrange
        val sourceCode =
            """
            class UserProfile {
                val userName = "John"
            }
            """.trimIndent()

        // Act
        val result = stage.extract(sourceCode)

        // Assert
        val identifiers = result.filter { it.context == ExtractionContext.IDENTIFIER }
        assertTrue(identifiers.any { it.text == "UserProfile" })
        assertTrue(identifiers.any { it.text == "userName" })
    }

    @Test
    fun `should extract identifiers from function declaration`() {
        // Arrange
        val sourceCode =
            """
            fun calculateTotal(price: Double, quantity: Int): Double {
                return price * quantity
            }
            """.trimIndent()

        // Act
        val result = stage.extract(sourceCode)

        // Assert
        val identifiers = result.filter { it.context == ExtractionContext.IDENTIFIER }
        assertTrue(identifiers.any { it.text == "calculateTotal" })
        assertTrue(identifiers.any { it.text == "price" })
        assertTrue(identifiers.any { it.text == "quantity" })
    }

    @Test
    fun `should extract all contexts from mixed source code`() {
        // Arrange
        val sourceCode =
            """
            // Process user orders
            class OrderProcessor {
                fun process(order: String) {
                    println("Processing order")
                }
            }
            """.trimIndent()

        // Act
        val result = stage.extract(sourceCode)

        // Assert
        val identifiers = result.filter { it.context == ExtractionContext.IDENTIFIER }
        val comments = result.filter { it.context == ExtractionContext.COMMENT }
        val strings = result.filter { it.context == ExtractionContext.STRING }

        assertTrue(identifiers.isNotEmpty())
        assertTrue(comments.isNotEmpty())
        assertTrue(strings.isNotEmpty())

        assertTrue(identifiers.any { it.text == "OrderProcessor" })
        assertTrue(identifiers.any { it.text == "process" })
        assertTrue(comments.any { it.text.contains("Process user orders") })
        assertTrue(strings.any { it.text == "Processing order" })
    }

    @Test
    fun `should handle escaped quotes in strings`() {
        // Arrange
        val sourceCode =
            """
            val text = "Hello \"World\""
            """.trimIndent()

        // Act
        val result = stage.extract(sourceCode)

        // Assert
        val strings = result.filter { it.context == ExtractionContext.STRING }
        assertTrue(strings.isNotEmpty())
    }

    @Test
    fun `should extract from data class with multiple properties`() {
        // Arrange
        val sourceCode =
            """
            data class Customer(
                val customerId: String,
                val customerName: String,
                val customerEmail: String
            )
            """.trimIndent()

        // Act
        val result = stage.extract(sourceCode)

        // Assert
        val identifiers = result.filter { it.context == ExtractionContext.IDENTIFIER }
        assertTrue(identifiers.any { it.text == "Customer" })
        assertTrue(identifiers.any { it.text == "customerId" })
        assertTrue(identifiers.any { it.text == "customerName" })
        assertTrue(identifiers.any { it.text == "customerEmail" })
    }

    @Test
    fun `should extract from enum class`() {
        // Arrange
        val sourceCode =
            """
            enum class Status {
                PENDING,
                ACTIVE,
                COMPLETED
            }
            """.trimIndent()

        // Act
        val result = stage.extract(sourceCode)

        // Assert
        val identifiers = result.filter { it.context == ExtractionContext.IDENTIFIER }
        assertTrue(identifiers.any { it.text == "Status" })
        assertTrue(identifiers.any { it.text == "PENDING" })
        assertTrue(identifiers.any { it.text == "ACTIVE" })
        assertTrue(identifiers.any { it.text == "COMPLETED" })
    }

    @Test
    fun `should handle comments with special characters`() {
        // Arrange
        val sourceCode =
            """
            // TODO: Fix this! @important #123
            fun test() {}
            """.trimIndent()

        // Act
        val result = stage.extract(sourceCode)

        // Assert
        val comments = result.filter { it.context == ExtractionContext.COMMENT }
        assertTrue(comments.any { it.text.contains("TODO") })
        assertTrue(comments.any { it.text.contains("important") })
    }

    @Test
    fun `should extract from nested classes`() {
        // Arrange
        val sourceCode =
            """
            class Outer {
                class Inner {
                    val innerProperty = "test"
                }
            }
            """.trimIndent()

        // Act
        val result = stage.extract(sourceCode)

        // Assert
        val identifiers = result.filter { it.context == ExtractionContext.IDENTIFIER }
        assertTrue(identifiers.any { it.text == "Outer" })
        assertTrue(identifiers.any { it.text == "Inner" })
        assertTrue(identifiers.any { it.text == "innerProperty" })
    }

    @Test
    fun `should extract from interface declaration`() {
        // Arrange
        val sourceCode =
            """
            interface Drawable {
                fun draw()
            }
            """.trimIndent()

        // Act
        val result = stage.extract(sourceCode)

        // Assert
        val identifiers = result.filter { it.context == ExtractionContext.IDENTIFIER }
        assertTrue(identifiers.any { it.text == "Drawable" })
        assertTrue(identifiers.any { it.text == "draw" })
    }

    @Test
    fun `should extract from object declaration`() {
        // Arrange
        val sourceCode =
            """
            object Singleton {
                val instance = "singleton"
            }
            """.trimIndent()

        // Act
        val result = stage.extract(sourceCode)

        // Assert
        val identifiers = result.filter { it.context == ExtractionContext.IDENTIFIER }
        assertTrue(identifiers.any { it.text == "Singleton" })
        assertTrue(identifiers.any { it.text == "instance" })
    }

    @Test
    fun `should extract identifiers comments and strings from Rust source code`() {
        // Arrange
        val rustStage = ExtractStage(Language.RUST)
        val sourceCode =
            """
            // Represents a customer order
            struct OrderProcessor {
                order_id: String,
            }

            impl OrderProcessor {
                fn process(&self) {
                    let message = "Processing order";
                    println!("{}", message);
                }
            }
            """.trimIndent()

        // Act
        val result = rustStage.extract(sourceCode)

        // Assert
        val identifiers = result.filter { it.context == ExtractionContext.IDENTIFIER }
        val comments = result.filter { it.context == ExtractionContext.COMMENT }
        val strings = result.filter { it.context == ExtractionContext.STRING }
        assertTrue(identifiers.any { it.text == "OrderProcessor" })
        assertTrue(identifiers.any { it.text == "process" })
        assertTrue(comments.any { it.text.contains("customer order") })
        assertTrue(strings.any { it.text == "Processing order" })
    }
}
