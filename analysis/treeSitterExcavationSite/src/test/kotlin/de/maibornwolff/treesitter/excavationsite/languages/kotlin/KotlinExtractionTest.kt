package de.maibornwolff.treesitter.excavationsite.languages.kotlin

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterExtraction
import de.maibornwolff.treesitter.excavationsite.shared.domain.ExtractionContext
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class KotlinExtractionTest {
    // === Identifier Extraction Tests (ported from Whurdle) ===

    @Test
    fun `should extract type alias identifier`() {
        // Arrange
        val code = "typealias UserId = String"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.KOTLIN)

        // Assert
        assertThat(result.identifiers).containsExactly("UserId")
    }

    @Test
    fun `should extract multiple type aliases`() {
        // Arrange
        val code = """
            typealias UserId = String
            typealias OrderId = Int
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.KOTLIN)

        // Assert
        assertThat(result.identifiers).containsExactly("UserId", "OrderId")
    }

    @Test
    fun `should extract class parameter identifiers`() {
        // Arrange
        val code = """
            class User(val name: String, val age: Int)
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.KOTLIN)

        // Assert
        assertThat(result.identifiers).containsExactly("User", "name", "age")
    }

    @Test
    fun `should extract function parameter identifiers`() {
        // Arrange
        val code = """
            fun calculateTotal(price: Double, quantity: Int): Double {
                return price * quantity
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.KOTLIN)

        // Assert
        assertThat(result.identifiers).containsExactly("calculateTotal", "price", "quantity")
    }

    @Test
    fun `should extract enum entry identifiers`() {
        // Arrange
        val code = """
            enum class Status {
                PENDING,
                ACTIVE,
                COMPLETED
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.KOTLIN)

        // Assert
        assertThat(result.identifiers).containsExactly("Status", "PENDING", "ACTIVE", "COMPLETED")
    }

    @Test
    fun `should extract enum entries with parameters`() {
        // Arrange
        val code = """
            enum class Color(val rgb: Int) {
                RED(0xFF0000),
                GREEN(0x00FF00),
                BLUE(0x0000FF)
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.KOTLIN)

        // Assert
        assertThat(result.identifiers).containsExactly("Color", "rgb", "RED", "GREEN", "BLUE")
    }

    @Test
    fun `should extract annotation class identifier`() {
        // Arrange
        val code = """
            @Target(AnnotationTarget.CLASS)
            annotation class MyAnnotation
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.KOTLIN)

        // Assert
        assertThat(result.identifiers).containsExactly("MyAnnotation")
    }

    @Test
    fun `should extract class declaration identifier`() {
        // Arrange
        val code = "class UserProfile"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.KOTLIN)

        // Assert
        assertThat(result.identifiers).containsExactly("UserProfile")
    }

    @Test
    fun `should extract interface declaration identifier`() {
        // Arrange
        val code = "interface Drawable"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.KOTLIN)

        // Assert
        assertThat(result.identifiers).containsExactly("Drawable")
    }

    @Test
    fun `should extract object declaration identifier`() {
        // Arrange
        val code = "object Singleton"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.KOTLIN)

        // Assert
        assertThat(result.identifiers).containsExactly("Singleton")
    }

    @Test
    fun `should extract function declaration identifier`() {
        // Arrange
        val code = "fun processOrder() {}"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.KOTLIN)

        // Assert
        assertThat(result.identifiers).containsExactly("processOrder")
    }

    @Test
    fun `should extract property declaration identifiers`() {
        // Arrange
        val code = """
            val userName = "John"
            var userAge = 30
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.KOTLIN)

        // Assert
        assertThat(result.identifiers).containsExactly("userName", "userAge")
    }

    @Test
    fun `should extract identifiers from complex class`() {
        // Arrange
        val code = """
            class OrderProcessor(val orderId: String) {
                var status: String = "pending"

                fun processOrder(customerId: String) {
                    val result = validate()
                }

                private fun validate(): Boolean {
                    return true
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.KOTLIN)

        // Assert
        assertThat(result.identifiers).containsExactly(
            "OrderProcessor",
            "orderId",
            "status",
            "processOrder",
            "customerId",
            "result",
            "validate"
        )
    }

    @Test
    fun `should handle empty source code`() {
        // Arrange
        val code = ""

        // Act
        val result = TreeSitterExtraction.extract(code, Language.KOTLIN)

        // Assert
        assertThat(result.identifiers).isEmpty()
        assertThat(result.comments).isEmpty()
        assertThat(result.strings).isEmpty()
    }

    @Test
    fun `should extract identifiers from data class`() {
        // Arrange
        val code = """
            data class User(
                val userId: String,
                val userName: String,
                val userEmail: String
            )
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.KOTLIN)

        // Assert
        assertThat(result.identifiers).containsExactly("User", "userId", "userName", "userEmail")
    }

    @Test
    fun `should extract identifiers from sealed class hierarchy`() {
        // Arrange
        val code = """
            sealed class Result {
                data class Success(val data: String) : Result()
                data class Error(val message: String) : Result()
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.KOTLIN)

        // Assert
        assertThat(result.identifiers).containsExactly("Result", "Success", "data", "Error", "message")
    }

    // === Comment Extraction Tests ===

    @Test
    fun `should extract single line comment`() {
        // Arrange
        val code = """
            // This is a comment
            val x = 1
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.KOTLIN)

        // Assert
        assertThat(result.comments).hasSize(1)
        assertThat(result.comments[0]).isEqualTo("This is a comment")
    }

    @Test
    fun `should extract multiple single line comments`() {
        // Arrange
        val code = """
            // First comment
            val x = 1
            // Second comment
            val y = 2
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.KOTLIN)

        // Assert
        assertThat(result.comments).containsExactly("First comment", "Second comment")
    }

    @Test
    fun `should extract multiline comment`() {
        // Arrange
        val code = """
            /*
             * This is a
             * multiline comment
             */
            val x = 1
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.KOTLIN)

        // Assert
        assertThat(result.comments).containsExactly("This is a\nmultiline comment")
    }

    @Test
    fun `should extract doc comment`() {
        // Arrange
        val code = """
            /**
             * Documentation for the function
             * @param x the input value
             */
            fun process(x: Int) {}
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.KOTLIN)

        // Assert
        assertThat(result.comments).containsExactly("Documentation for the function\n@param x the input value")
    }

    // === String Extraction Tests ===

    @Test
    fun `should extract double quoted string`() {
        // Arrange
        val code = """val message = "Hello World""""

        // Act
        val result = TreeSitterExtraction.extract(code, Language.KOTLIN)

        // Assert
        assertThat(result.strings).containsExactly("Hello World")
    }

    @Test
    fun `should extract multiple strings`() {
        // Arrange
        val code = """
            val first = "Hello"
            val second = "World"
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.KOTLIN)

        // Assert
        assertThat(result.strings).containsExactly("Hello", "World")
    }

    @Test
    fun `should extract triple quoted string`() {
        // Arrange
        val code = """
            val multiline = ${"\"\"\""}
                This is a
                multiline string
            ${"\"\"\""}
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.KOTLIN)

        // Assert
        assertThat(result.strings).hasSize(1)
        assertThat(result.strings[0]).isEqualTo("\n    This is a\n    multiline string\n")
    }

    // === ExtractionResult Tests ===

    @Test
    fun `should correctly categorize extracted items by context`() {
        // Arrange
        val code = """
            // Comment about the class
            class Example {
                val name = "test"
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.KOTLIN)

        // Assert
        assertThat(result.identifiers).containsExactly("Example", "name")
        assertThat(result.comments).containsExactly("Comment about the class")
        assertThat(result.strings).containsExactly("test")
    }

    @Test
    fun `should provide access via extractedTexts list`() {
        // Arrange
        val code = """
            // Comment
            class Foo
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.KOTLIN)

        // Assert
        assertThat(result.extractedTexts.map { it.context }).containsExactly(
            ExtractionContext.COMMENT,
            ExtractionContext.IDENTIFIER
        )
    }

    // === API Tests ===

    @Test
    fun `should report extraction is supported for Kotlin`() {
        // Act & Assert
        assertThat(TreeSitterExtraction.isExtractionSupported(Language.KOTLIN)).isTrue()
        assertThat(TreeSitterExtraction.isExtractionSupported(".kt")).isTrue()
        assertThat(TreeSitterExtraction.isExtractionSupported(".kts")).isTrue()
    }

    @Test
    fun `should return Kotlin in supported languages`() {
        // Act & Assert
        assertThat(TreeSitterExtraction.isExtractionSupported(Language.KOTLIN)).isTrue()
    }

    @Test
    fun `should return kt and kts in supported extensions`() {
        // Act & Assert
        assertThat(TreeSitterExtraction.isExtractionSupported(".kt")).isTrue()
        assertThat(TreeSitterExtraction.isExtractionSupported(".kts")).isTrue()
    }

    // === Lambda Parameter Extraction Tests ===

    @Test
    fun `should extract lambda parameters`() {
        // Arrange
        val code = "list.forEach { item -> println(item) }"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.KOTLIN)

        // Assert
        assertThat(result.identifiers).containsExactly("item")
    }

    @Test
    fun `should extract multiple lambda parameters`() {
        // Arrange
        val code = "map.forEach { key, value -> println(key) }"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.KOTLIN)

        // Assert
        assertThat(result.identifiers).containsExactly("key", "value")
    }

    @Test
    fun `should extract lambda destructuring parameters`() {
        // Arrange
        val code = "map.forEach { (key, value) -> println(key) }"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.KOTLIN)

        // Assert
        assertThat(result.identifiers).containsExactly("key", "value")
    }

    // === Destructuring Declaration Tests ===

    @Test
    fun `should extract destructuring declaration variables`() {
        // Arrange
        val code = "val (name, age) = person"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.KOTLIN)

        // Assert
        assertThat(result.identifiers).containsExactly("name", "age")
    }

    @Test
    fun `should extract destructuring in for loop`() {
        // Arrange
        val code = """
            for ((key, value) in map) {
                println(key)
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.KOTLIN)

        // Assert
        assertThat(result.identifiers).containsExactly("key", "value")
    }

    // === When Subject Variable Tests ===

    @Test
    fun `should extract when subject variable`() {
        // Arrange
        val code = """
            when (val result = compute()) {
                is Success -> result.data
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.KOTLIN)

        // Assert
        assertThat(result.identifiers).containsExactly("result")
    }

    // === Setter Parameter Tests ===

    @Test
    fun `should extract setter parameter`() {
        // Arrange
        val code = """
            var name: String = ""
                set(value) { field = value }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.KOTLIN)

        // Assert
        assertThat(result.identifiers).containsExactly("name", "value")
    }

    // === Secondary Constructor Tests (verification) ===

    @Test
    fun `should extract secondary constructor parameters`() {
        // Arrange
        val code = """
            class Person {
                constructor(name: String, age: Int)
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.KOTLIN)

        // Assert
        assertThat(result.identifiers).containsExactly("Person", "name", "age")
    }

    // === Catch Block Parameter Tests ===

    @Test
    fun `should extract catch block exception variable`() {
        // Arrange
        val code = "try { foo() } catch (e: Exception) { log(e) }"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.KOTLIN)

        // Assert
        assertThat(result.identifiers).containsExactly("e")
    }

    @Test
    fun `should extract multiple catch block variables`() {
        // Arrange
        // Note: catch blocks must be on same line as try for tree-sitter to parse correctly
        val code = "try { foo() } catch (io: IOException) { } catch (ex: Exception) { }"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.KOTLIN)

        // Assert
        assertThat(result.identifiers).containsExactly("io", "ex")
    }

    // === Type Parameter Tests ===

    @Test
    fun `should extract type parameter from class`() {
        // Arrange
        val code = "class Box<T>(val value: T)"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.KOTLIN)

        // Assert
        assertThat(result.identifiers).containsExactly("Box", "T", "value")
    }

    @Test
    fun `should extract type parameter from function`() {
        // Arrange
        val code = "fun <T> identity(value: T): T = value"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.KOTLIN)

        // Assert
        assertThat(result.identifiers).containsExactly("identity", "T", "value")
    }

    @Test
    fun `should extract multiple type parameters`() {
        // Arrange
        val code = "class Pair<K, V>(val key: K, val value: V)"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.KOTLIN)

        // Assert
        assertThat(result.identifiers).containsExactly("Pair", "K", "V", "key", "value")
    }

    // === Label Tests ===

    @Test
    fun `should extract label from for loop`() {
        // Arrange
        val code = "loop@ for (i in 1..10) { break@loop }"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.KOTLIN)

        // Assert
        // Labels are extracted from both definition (loop@) and reference (break@loop)
        assertThat(result.identifiers).containsExactly("loop", "i", "loop")
    }

    @Test
    fun `should extract nested labels`() {
        // Arrange
        val code = """
            outer@ while (true) {
                inner@ while (true) {
                    break@outer
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.KOTLIN)

        // Assert
        // Labels are extracted from both definitions and references
        assertThat(result.identifiers).containsExactly("outer", "inner", "outer")
    }

    // === For Loop Variable Tests ===

    @Test
    fun `should extract simple for loop variable`() {
        // Arrange
        val code = "for (i in 1..10) { println(i) }"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.KOTLIN)

        // Assert
        assertThat(result.identifiers).containsExactly("i")
    }

    // === Underscore Filtering Tests ===

    @Test
    fun `should filter out underscore in destructuring`() {
        // Arrange
        val code = "val (_, age) = person"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.KOTLIN)

        // Assert
        assertThat(result.identifiers).containsExactly("age")
        assertThat(result.identifiers).doesNotContain("_")
    }

    @Test
    fun `should filter out underscore in lambda destructuring`() {
        // Arrange
        val code = "map.forEach { (_, value) -> println(value) }"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.KOTLIN)

        // Assert
        assertThat(result.identifiers).containsExactly("value")
    }

    // === Edge Case Tests ===

    @Test
    fun `should handle lambda with no parameters`() {
        // Arrange
        val code = "run { println(42) }"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.KOTLIN)

        // Assert
        assertThat(result.identifiers).isEmpty()
    }

    @Test
    fun `should handle lambda with implicit it parameter`() {
        // Arrange - 'it' is implicit, not declared
        val code = "list.filter { it > 0 }"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.KOTLIN)

        // Assert
        assertThat(result.identifiers).isEmpty()
    }

    @Test
    fun `should filter out underscore as only lambda parameter`() {
        // Arrange
        val code = "list.forEach { _ -> println(42) }"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.KOTLIN)

        // Assert
        assertThat(result.identifiers).isEmpty()
    }

    @Test
    fun `should filter out underscore in for loop`() {
        // Arrange
        val code = "for (_ in list) { count++ }"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.KOTLIN)

        // Assert
        assertThat(result.identifiers).isEmpty()
    }

    @Test
    fun `should filter out multiple underscores in destructuring`() {
        // Arrange
        val code = "val (_, _, third) = triple"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.KOTLIN)

        // Assert
        assertThat(result.identifiers).containsExactly("third")
    }

    @Test
    fun `should extract backtick-escaped identifiers`() {
        // Arrange
        val code = "fun `test with spaces`() { }"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.KOTLIN)

        // Assert
        assertThat(result.identifiers).containsExactly("`test with spaces`")
    }

    @Test
    fun `should extract extension function name`() {
        // Arrange
        val code = "fun String.addExclamation(): String = this + \"!\""

        // Act
        val result = TreeSitterExtraction.extract(code, Language.KOTLIN)

        // Assert
        assertThat(result.identifiers).containsExactly("addExclamation")
    }

    @Test
    fun `should extract operator function name`() {
        // Arrange
        val code = "operator fun Point.plus(other: Point): Point = Point(x + other.x, y + other.y)"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.KOTLIN)

        // Assert
        assertThat(result.identifiers).containsExactly("plus", "other")
    }

    @Test
    fun `should extract infix function name`() {
        // Arrange
        val code = "infix fun Int.times(str: String) = str.repeat(this)"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.KOTLIN)

        // Assert
        assertThat(result.identifiers).containsExactly("times", "str")
    }

    @Test
    fun `should extract nested generic type parameters`() {
        // Arrange
        val code = "class Container<T, U>(val first: T, val second: U)"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.KOTLIN)

        // Assert
        assertThat(result.identifiers).containsExactly("Container", "T", "U", "first", "second")
    }

    @Test
    fun `should extract bounded type parameter`() {
        // Arrange
        val code = "fun <T : Comparable<T>> sort(list: List<T>): List<T> = list.sorted()"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.KOTLIN)

        // Assert
        assertThat(result.identifiers).containsExactly("sort", "T", "list")
    }

    @Test
    fun `should handle deeply nested structure`() {
        // Arrange
        val code = """
            class Outer<T>(val outer: T) {
                fun process(items: List<T>) {
                    items.forEach { item ->
                        val (first, second) = Pair(item, item)
                    }
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.KOTLIN)

        // Assert
        assertThat(result.identifiers).containsExactly(
            "Outer",
            "T",
            "outer",
            "process",
            "items",
            "item",
            "first",
            "second"
        )
    }

    @Test
    fun `should extract from nested class`() {
        // Arrange
        val code = """
            class Outer {
                class Inner(val value: Int)
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.KOTLIN)

        // Assert
        assertThat(result.identifiers).containsExactly("Outer", "Inner", "value")
    }

    @Test
    fun `should extract from object inside class`() {
        // Arrange
        val code = """
            class MyClass {
                object Factory {
                    fun create(): MyClass = MyClass()
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.KOTLIN)

        // Assert
        assertThat(result.identifiers).containsExactly("MyClass", "Factory", "create")
    }

    @Test
    fun `should extract local function`() {
        // Arrange
        val code = """
            fun outer() {
                fun inner(x: Int): Int = x * 2
                inner(5)
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.KOTLIN)

        // Assert
        assertThat(result.identifiers).containsExactly("outer", "inner", "x")
    }

    @Test
    fun `should extract from try-catch-finally`() {
        // Arrange
        val code = "try { risky() } catch (e: Exception) { log(e) } finally { cleanup() }"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.KOTLIN)

        // Assert
        assertThat(result.identifiers).containsExactly("e")
    }

    @Test
    fun `should extract when subject with complex expression`() {
        // Arrange
        val code = "when (val len = str.length) { 0 -> empty() else -> process(len) }"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.KOTLIN)

        // Assert
        assertThat(result.identifiers).containsExactly("len")
    }

    @Test
    fun `should handle empty class`() {
        // Arrange
        val code = "class Empty"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.KOTLIN)

        // Assert
        assertThat(result.identifiers).containsExactly("Empty")
    }

    @Test
    fun `should handle interface with generic parameter`() {
        // Arrange
        val code = "interface Repository<T> { fun findById(id: Long): T }"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.KOTLIN)

        // Assert
        assertThat(result.identifiers).containsExactly("Repository", "T", "findById", "id")
    }

    @Test
    fun `should extract from multiple lambdas in chain`() {
        // Arrange
        val code = "list.filter { x -> x > 0 }.map { y -> y * 2 }"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.KOTLIN)

        // Assert
        assertThat(result.identifiers).containsExactly("x", "y")
    }

    @Test
    fun `should handle for loop with range and step`() {
        // Arrange
        val code = "for (i in 0..100 step 10) { println(i) }"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.KOTLIN)

        // Assert
        assertThat(result.identifiers).containsExactly("i")
    }

    @Test
    fun `should handle labeled return in lambda`() {
        // Arrange
        val code = "list.forEach label@{ item -> if (item == 0) return@label else process(item) }"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.KOTLIN)

        // Assert
        // Labels are extracted from both definition (label@) and reference (return@label)
        assertThat(result.identifiers).containsExactly("label", "item", "label")
    }

    @Test
    fun `should extract suspend function parameters`() {
        // Arrange
        val code = "suspend fun fetchData(url: String, timeout: Long): Result = api.get(url)"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.KOTLIN)

        // Assert
        assertThat(result.identifiers).containsExactly("fetchData", "url", "timeout")
    }

    @Test
    fun `should extract inline function with reified type`() {
        // Arrange
        val code = "inline fun <reified T> parseJson(json: String): T = gson.fromJson(json, T::class.java)"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.KOTLIN)

        // Assert
        assertThat(result.identifiers).containsExactly("parseJson", "T", "json")
    }

    @Test
    fun `should handle destructuring with more than two variables`() {
        // Arrange
        val code = "val (a, b, c, d, e) = quintuple"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.KOTLIN)

        // Assert
        assertThat(result.identifiers).containsExactly("a", "b", "c", "d", "e")
    }

    @Test
    fun `should handle mixed underscore and named in large destructuring`() {
        // Arrange
        val code = "val (_, second, _, fourth, _) = tuple"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.KOTLIN)

        // Assert
        assertThat(result.identifiers).containsExactly("second", "fourth")
    }

    @Test
    fun `should extract vararg parameter`() {
        // Arrange
        val code = "fun printAll(vararg messages: String) { messages.forEach { println(it) } }"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.KOTLIN)

        // Assert
        assertThat(result.identifiers).containsExactly("printAll", "messages")
    }

    @Test
    fun `should extract default parameter value identifiers`() {
        // Arrange
        val code = "fun greet(name: String = defaultName, greeting: String = hello) { }"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.KOTLIN)

        // Assert
        assertThat(result.identifiers).containsExactly("greet", "name", "greeting")
    }

    @Test
    fun `should handle single expression function`() {
        // Arrange
        val code = "fun double(x: Int) = x * 2"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.KOTLIN)

        // Assert
        assertThat(result.identifiers).containsExactly("double", "x")
    }

    @Test
    fun `should extract from getter with backing field`() {
        // Arrange
        val code = """
            var counter: Int = 0
                get() = field
                set(value) { field = value }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.KOTLIN)

        // Assert
        assertThat(result.identifiers).containsExactly("counter", "value")
    }

    @Test
    fun `should handle unicode identifiers`() {
        // Arrange
        val code = "val größe = 42"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.KOTLIN)

        // Assert
        assertThat(result.identifiers).containsExactly("größe")
    }

    @Test
    fun `should handle single underscore property`() {
        // Arrange - single underscore as regular identifier (not in destructuring)
        val code = "val _ = computeUnused()"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.KOTLIN)

        // Assert
        // Single underscore as property name should be filtered out
        assertThat(result.identifiers).isEmpty()
    }
}
