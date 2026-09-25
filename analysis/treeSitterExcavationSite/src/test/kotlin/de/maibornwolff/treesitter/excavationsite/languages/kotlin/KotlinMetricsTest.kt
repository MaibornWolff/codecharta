package de.maibornwolff.treesitter.excavationsite.languages.kotlin

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterMetrics
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class KotlinMetricsTest {
    @Test
    fun `should count elvis operator for complexity`() {
        // Arrange
        val code = """val y = x ?: 2"""

        // Act
        val result = TreeSitterMetrics.parse(code, Language.KOTLIN)

        // Assert
        assertThat(result.complexity).isEqualTo(1.0)
    }

    @Test
    fun `should count conjunction expressions for complexity`() {
        // Arrange
        val code = """if (x == 0 && y < 1) return true"""

        // Act
        val result = TreeSitterMetrics.parse(code, Language.KOTLIN)

        // Assert
        assertThat(result.complexity).isEqualTo(2.0)
    }

    @Test
    fun `should count lambda expressions for complexity`() {
        // Arrange
        val code = """val sum = { x: Int, y: Int -> x + y }"""

        // Act
        val result = TreeSitterMetrics.parse(code, Language.KOTLIN)

        // Assert
        assertThat(result.complexity).isEqualTo(1.0)
    }

    @Test
    fun `should count each possibility in when case for complexity`() {
        // Arrange
        val code = """
            when (x) {
                1 -> print("x == 1")
                2 -> print("x == 2")
                else -> print("x is neither 1 nor 2")
            }
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.KOTLIN)

        // Assert
        assertThat(result.complexity).isEqualTo(3.0)
    }

    @Test
    fun `should count filters and maps for complexity`() {
        // Arrange
        val code = """numberList.filter { it % 2 == 0 }.map { it * 2 }"""

        // Act
        val result = TreeSitterMetrics.parse(code, Language.KOTLIN)

        // Assert
        assertThat(result.complexity).isEqualTo(2.0)
    }

    @Test
    fun `should count line and block comments for comment_lines`() {
        // Arrange
        val code = """
            /**
             * docstring comment
             * over
             * multiple lines
             */
            fun helloWorld() {
                // line comment
                println("Hello") /* comment in code */; println("world")
            }
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.KOTLIN)

        // Assert
        assertThat(result.commentLines).isEqualTo(7.0)
    }

    @Test
    fun `should not include comments or empty lines for rloc`() {
        // Arrange
        val code = """
            if (x == 2) {
                // comment


                return true
            }
        """.trimIndent() + "\n"

        // Act
        val result = TreeSitterMetrics.parse(code, Language.KOTLIN)

        // Assert
        assertThat(result.realLinesOfCode).isEqualTo(3.0)
    }

    @Test
    fun `should count empty lines and comments for loc`() {
        // Arrange
        val code = """
            if (x == 2) {
                // comment


                return true
            }
        """.trimIndent() + "\n"

        // Act
        val result = TreeSitterMetrics.parse(code, Language.KOTLIN)

        // Assert
        assertThat(result.linesOfCode).isEqualTo(6.0)
    }

    @Test
    fun `should count function declaration for number of functions only when it includes implementation`() {
        // Arrange
        val code = """
        private fun main() {
            println("Hello, World!")
        }

        private fun otherFunction(): String {
            return "Hello, World!"
        }

        fun turn(direction: Direction, radius: Double, startSpeed: Double, endSpeed: Double)
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.KOTLIN)

        // Assert
        assertThat(result.numberOfFunctions).isEqualTo(2.0)
    }

    @Test
    fun `should count getter and setter functions for number of functions`() {
        // Arrange
        val code = """
            class Point(var x: Int, var y: Int) {
                var coordinates: String
                    get() = "${'$'}x,${'$'}y"
                    set(value) {
                        val parts = value.split(",")
                        x = parts[0].toInt()
                        y = parts[1].toInt()
                    }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.KOTLIN)

        // Assert
        assertThat(result.numberOfFunctions).isEqualTo(2.0)
    }

    @Test
    fun `should count lambda function for number of functions only when they are assigned to a variable`() {
        // Arrange
        val code = """
            val sum = { x: Int, y: Int -> x + y }

            val product = items.fold(1) { acc, e -> acc * e }
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.KOTLIN)

        // Assert
        assertThat(result.numberOfFunctions).isEqualTo(1.0)
    }

    @Test
    fun `should count anonymous function for number of functions only when they are assigned to a variable`() {
        // Arrange
        val code = """
            val adder = fun(x: Int, y: Int): Int {
                return x + y
            }

            ints.filter(fun(item) = item > 0)
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.KOTLIN)

        // Assert
        assertThat(result.numberOfFunctions).isEqualTo(1.0)
    }

    @Test
    fun `should count secondary constructor for number of functions`() {
        // Arrange
        val code = """
            class Person(val name: String) {
                val children: MutableList<Person> = mutableListOf()
                constructor(name: String, parent: Person) : this(name) {
                    parent.children.add(this)
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.KOTLIN)

        // Assert
        assertThat(result.numberOfFunctions).isEqualTo(1.0)
    }

    @Test
    fun `should correctly calculate all measures for parameters per function metric`() {
        // Arrange
        val code = """
            fun printSomething() {
                println("Something")
            }

            fun anotherFun(a: Int, b: Int): Int {
                return a + b
            }

            fun power(x: Int, y: Int): Int {
                return x.toDouble().pow(y.toDouble()).toInt()
            }

            fun oneParameter(x: Int): Int {
                return x * 2
            }
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.KOTLIN)

        // Assert
        assertThat(result.perFunctionMetrics["max_parameters_per_function"]).isEqualTo(2.0)
        assertThat(result.perFunctionMetrics["min_parameters_per_function"]).isEqualTo(0.0)
        assertThat(result.perFunctionMetrics["mean_parameters_per_function"]).isEqualTo(1.25)
        assertThat(result.perFunctionMetrics["median_parameters_per_function"]).isEqualTo(1.5)
    }

    @Test
    fun `should correctly calculate all measures for complexity per function metric`() {
        // Arrange
        val code = """
            fun noComplexity() {
                println("hello")
            }

            fun complexFun(a: Int, b: Int): Int {
                return when (a) {
                    1 -> {
                        if (a * b > 10) {
                            a
                        } else {
                            b
                        }
                    }
                    2 -> {
                        if ((a + b) % 2 == 0) {
                            println("Sum is even")
                            b
                        } else {
                            0
                        }
                    }
                    else -> a
                }
            }

            fun isEven(x: Int): Boolean {
                return if (x % 2 == 0) true else false
            }
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.KOTLIN)

        // Assert
        assertThat(result.perFunctionMetrics["max_complexity_per_function"]).isEqualTo(5.0)
        assertThat(result.perFunctionMetrics["min_complexity_per_function"]).isEqualTo(0.0)
        assertThat(result.perFunctionMetrics["mean_complexity_per_function"]).isEqualTo(2.0)
        assertThat(result.perFunctionMetrics["median_complexity_per_function"]).isEqualTo(1.0)
    }

    @Test
    fun `should correctly calculate rloc per function metric`() {
        // Arrange
        val code = """
            fun functionOne() {
            // comment at start of function
                println("This is function one")
                // inline comment
                Unit
            }

            fun functionTwo(x: Int): Int {
                return x * 2
            }
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.KOTLIN)

        // Assert
        assertThat(result.perFunctionMetrics["max_rloc_per_function"]).isEqualTo(2.0)
        assertThat(result.perFunctionMetrics["min_rloc_per_function"]).isEqualTo(1.0)
        assertThat(result.perFunctionMetrics["mean_rloc_per_function"]).isEqualTo(1.5)
        assertThat(result.perFunctionMetrics["median_rloc_per_function"]).isEqualTo(1.5)
    }

    @Test
    fun `should detect message chains with 4 or more method calls`() {
        // Arrange
        val code = """obj.a().field.b().c().d()"""

        // Act
        val result = TreeSitterMetrics.parse(code, Language.KOTLIN)

        // Assert
        assertThat(result.messageChains).isEqualTo(1.0)
    }

    @Test
    fun `should count LOC correctly for code without trailing newline`() {
        // Arrange - 3 physical lines
        val code = """
            val a = 1
            val b = 2
            val c = 3
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.KOTLIN)

        // Assert - LOC equals RLOC for code without blanks or comments
        assertThat(result.linesOfCode).isEqualTo(3.0)
        assertThat(result.realLinesOfCode).isEqualTo(3.0)
    }
}
