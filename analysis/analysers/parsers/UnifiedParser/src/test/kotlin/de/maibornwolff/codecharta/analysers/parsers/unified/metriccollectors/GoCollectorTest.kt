package de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors

import de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes.AvailableFileMetrics
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.treesitter.TSParser
import org.treesitter.TreeSitterGo
import java.io.File

class GoCollectorTest {
    private var parser = TSParser()
    private val collector = GoCollector()

    @BeforeEach
    fun setUp() {
        parser.setLanguage(TreeSitterGo())
    }

    private fun createTestFile(content: String): File {
        val tempFile = File.createTempFile("testFile", ".txt")
        tempFile.writeText(content)
        tempFile.deleteOnExit()
        return tempFile
    }

    @Test
    fun `should count binary expressions for complexity`() {
        // given
        val fileContent = """
            if x > 0 && y < 10 || z == 5 {
                return true
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableFileMetrics.COMPLEXITY.metricName]).isEqualTo(3.0)
    }

    @Test
    fun `should count switch statement for complexity`() {
        // given
        val fileContent = """
            switch value {
            case 1:
                break
            case 2:
                break
            default:
                break
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableFileMetrics.COMPLEXITY.metricName]).isEqualTo(3.0)
    }

    @Test
    fun `should count type switch cases for complexity`() {
        // given
        val fileContent = """
            switch x.(type) {
            case int:
                return 1
            case string:
                return 2
            default:
                return 0
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableFileMetrics.COMPLEXITY.metricName]).isEqualTo(3.0)
    }

    @Test
    fun `should count cases in select statement for complexity`() {
        // given
        val fileContent = """
            select {
            case <-ch1:
                return 1
            case ch2 <- value:
                return 2
            default:
                return 0
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableFileMetrics.COMPLEXITY.metricName]).isEqualTo(3.0)
    }

    @Test
    fun `should count function literal for complexity`() {
        // given
        val fileContent = """add := func(x, y int) int { return x + y }"""
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableFileMetrics.COMPLEXITY.metricName]).isEqualTo(1.0)
    }

    @Test
    fun `should count line and block comments for comment_lines`() {
        // given
        val fileContent = """
            /**
             * Block comment
             * over
             * multiple lines
             */
             func helloWorld() {
                 // line comment
                 fmt.Println("Hello") /* comment in code */ fmt.Println("world")
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
            if x == 2 {
                // comment


                return true
            }
        """.trimIndent()
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
            if x == 2 {
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
    fun `should count normal function declaration for number of functions`() {
        // given
        val fileContent = """
            func add(x int, y int) int {
                return x + y
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableFileMetrics.NUMBER_OF_FUNCTIONS.metricName]).isEqualTo(1.0)
    }

    @Test
    fun `should count function literal for number of functions`() {
        // given
        val fileContent = """
            f := func() {
                fmt.Println("I am a function literal!")
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableFileMetrics.NUMBER_OF_FUNCTIONS.metricName]).isEqualTo(1.0)
    }

    @Test
    fun `should count method declaration for number of functions`() {
        // given
        val fileContent = """
            func (v Vertex) Abs() float64 {
                return math.Sqrt(v.X*v.X + v.Y*v.Y)
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
            func printSomething() {
                fmt.Println("Something")
            }

            func anotherFun(a int, b int) int {
                return a + b
            }

            func power(x int, y int) int {
                return int(math.Pow(float64(x), float64(y)))
            }

            func oneParameter(x int) int {
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
}
