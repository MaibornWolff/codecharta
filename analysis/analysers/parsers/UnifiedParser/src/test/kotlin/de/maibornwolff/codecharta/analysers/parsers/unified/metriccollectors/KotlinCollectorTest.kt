package de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors

import de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes.AvailableFileMetrics
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.treesitter.TSParser
import org.treesitter.TreeSitterKotlin
import java.io.File

class KotlinCollectorTest {
    private var parser = TSParser()
    private val collector = KotlinCollector()

    @BeforeEach
    fun setUp() {
        parser.setLanguage(TreeSitterKotlin())
    }

    private fun createTestFile(content: String): File {
        val tempFile = File.createTempFile("testFile", ".txt")
        tempFile.writeText(content)
        tempFile.deleteOnExit()
        return tempFile
    }

    @Test
    fun `should count elvis operator for complexity`() {
        // given
        val fileContent = """val y = x ?: 2"""
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableFileMetrics.COMPLEXITY.metricName]).isEqualTo(1.0)
    }

    @Test
    fun `should count conjunction expressions for complexity`() {
        // given
        val fileContent = """if (x == 0 && y < 1) return true"""
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableFileMetrics.COMPLEXITY.metricName]).isEqualTo(2.0)
    }

    @Test
    fun `should count lambda expressions for complexity`() {
        // given
        val fileContent = """val sum = { x: Int, y: Int -> x + y }"""
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableFileMetrics.COMPLEXITY.metricName]).isEqualTo(1.0)
    }

    @Test
    fun `should count each possibility in when case for complexity`() {
        // given
        val fileContent = """
            when (x) {
                1 -> print("x == 1")
                2 -> print("x == 2")
                else -> print("x is neither 1 nor 2")
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableFileMetrics.COMPLEXITY.metricName]).isEqualTo(3.0)
    }

    @Test
    fun `should count filters and maps for complexity`() {
        // given
        val fileContent = """numberList.filter { it % 2 == 0 }.map { it * 2 }"""
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableFileMetrics.COMPLEXITY.metricName]).isEqualTo(2.0)
    }

    @Test
    fun `should count line and block comments for comment_lines`() {
        // given
        val fileContent = """
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
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableFileMetrics.COMMENT_LINES.metricName]).isEqualTo(7.0)
    }

    @Test
    fun `should not include comments or empty lines for rloc`() {
        // given
        val fileContent = """
            if (x == 2) {
                // comment


                return true
            }
        """.trimIndent() + "\n" // this newline simulates end of file
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableFileMetrics.REAL_LINES_OF_CODE.metricName]).isEqualTo(3.0)
    }

    @Test
    fun `should count empty lines and comments for loc`() {
        // given
        val fileContent = """
            if (x == 2) {
                // comment


                return true
            }
        """.trimIndent() + "\n" // this newline simulates end of file
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableFileMetrics.LINES_OF_CODE.metricName]).isEqualTo(6.0)
    }

    @Test
    fun `should count function declaration for number of functions only when it includes implementation`() {
        // given
        val fileContent = """
        private fun main() {
            println("Hello, World!")
        }

        private fun otherFunction(): String {
            return "Hello, World!"
        }

        fun turn(direction: Direction, radius: Double, startSpeed: Double, endSpeed: Double)
        """.trimIndent()
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableFileMetrics.NUMBER_OF_FUNCTIONS.metricName]).isEqualTo(2.0)
    }

    @Test
    fun `should count getter and setter functions for number of functions`() {
        // given
        val fileContent = """
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
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableFileMetrics.NUMBER_OF_FUNCTIONS.metricName]).isEqualTo(2.0)
    }

    @Test
    fun `should count lambda function for number of functions only when they are assigned to a variable`() {
        // given
        val fileContent = """
            val sum = { x: Int, y: Int -> x + y }

            val product = items.fold(1) { acc, e -> acc * e }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableFileMetrics.NUMBER_OF_FUNCTIONS.metricName]).isEqualTo(1.0)
    }

    @Test
    fun `should count anonymous function for number of functions only when they are assigned to a variable`() {
        // given
        val fileContent = """
            val adder = fun(x: Int, y: Int): Int {
                return x + y
            }

            ints.filter(fun(item) = item > 0)
        """.trimIndent()
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableFileMetrics.NUMBER_OF_FUNCTIONS.metricName]).isEqualTo(1.0)
    }

    @Test
    fun `should count secondary constructor for number of functions`() {
        // given
        val fileContent = """
            class Person(val name: String) {
                val children: MutableList<Person> = mutableListOf()
                constructor(name: String, parent: Person) : this(name) {
                    parent.children.add(this)
                }
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableFileMetrics.NUMBER_OF_FUNCTIONS.metricName]).isEqualTo(1.0)
    }

    @Test
    fun `should correctly calculate all measures for parameters per function metric`() {
        // given
        val fileContent = """
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
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes["max_parameters_per_function"]).isEqualTo(2.0)
        Assertions.assertThat(result.attributes["min_parameters_per_function"]).isEqualTo(0.0)
        Assertions.assertThat(result.attributes["mean_parameters_per_function"]).isEqualTo(1.25)
        Assertions.assertThat(result.attributes["median_parameters_per_function"]).isEqualTo(1.5)
    }

    @Test
    fun `should correctly calculate all measures for complexity per function metric`() {
        // given
        val fileContent = """
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
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes["max_complexity_per_function"]).isEqualTo(5.0)
        Assertions.assertThat(result.attributes["min_complexity_per_function"]).isEqualTo(0.0)
        Assertions.assertThat(result.attributes["mean_complexity_per_function"]).isEqualTo(2.0)
        Assertions.assertThat(result.attributes["median_complexity_per_function"]).isEqualTo(1.0)
    }

    @Test
    fun `should correctly calculate rloc per function metric`() {
        // given
        val fileContent = """
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
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes["max_rloc_per_function"]).isEqualTo(2.0)
        Assertions.assertThat(result.attributes["min_rloc_per_function"]).isEqualTo(1.0)
        Assertions.assertThat(result.attributes["mean_rloc_per_function"]).isEqualTo(1.5)
        Assertions.assertThat(result.attributes["median_rloc_per_function"]).isEqualTo(1.5)
    }
}
