package de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors

import de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes.AvailableMetrics
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
        Assertions.assertThat(result.attributes[AvailableMetrics.COMPLEXITY.metricName]).isEqualTo(1)
    }

    @Test
    fun `should count conjunction expressions for complexity`() {
        // given
        val fileContent = """if (x == 0 && y < 1) return true"""
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableMetrics.COMPLEXITY.metricName]).isEqualTo(2)
    }

    @Test
    fun `should count lambda expressions for complexity`() {
        // given
        val fileContent = """val sum = { x: Int, y: Int -> x + y }"""
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableMetrics.COMPLEXITY.metricName]).isEqualTo(1)
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
        Assertions.assertThat(result.attributes[AvailableMetrics.COMPLEXITY.metricName]).isEqualTo(3)
    }

    @Test
    fun `should count filters and maps for complexity`() {
        // given
        val fileContent = """numberList.filter { it % 2 == 0 }.map { it * 2 }"""
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableMetrics.COMPLEXITY.metricName]).isEqualTo(2)
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
        Assertions.assertThat(result.attributes[AvailableMetrics.COMMENT_LINES.metricName]).isEqualTo(7)
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
        Assertions.assertThat(result.attributes[AvailableMetrics.REAL_LINES_OF_CODE.metricName]).isEqualTo(3)
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
        Assertions.assertThat(result.attributes[AvailableMetrics.LINES_OF_CODE.metricName]).isEqualTo(6)
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
        Assertions.assertThat(result.attributes[AvailableMetrics.NUMBER_OF_FUNCTIONS.metricName]).isEqualTo(2)
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
        Assertions.assertThat(result.attributes[AvailableMetrics.NUMBER_OF_FUNCTIONS.metricName]).isEqualTo(2)
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
        Assertions.assertThat(result.attributes[AvailableMetrics.NUMBER_OF_FUNCTIONS.metricName]).isEqualTo(1)
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
        Assertions.assertThat(result.attributes[AvailableMetrics.NUMBER_OF_FUNCTIONS.metricName]).isEqualTo(1)
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
        Assertions.assertThat(result.attributes[AvailableMetrics.NUMBER_OF_FUNCTIONS.metricName]).isEqualTo(1)
    }
}
