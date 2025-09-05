package de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors

import de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes.AvailableMetrics
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.treesitter.TSParser
import org.treesitter.TreeSitterTypescript
import java.io.File

class TypescriptCollectorTest {
    private var parser = TSParser()
    private val collector = TypescriptCollector()

    @BeforeEach
    fun setUp() {
        parser.setLanguage(TreeSitterTypescript())
    }

    private fun createTestFile(content: String): File {
        val tempFile = File.createTempFile("testFile", ".txt")
        tempFile.writeText(content)
        tempFile.deleteOnExit()
        return tempFile
    }

    @Test
    fun `should count for in loop for complexity`() {
        // given
        val fileContent = """
            for (const x in person) {
              text += person[x];
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableMetrics.COMPLEXITY.metricName]).isEqualTo(1)
    }

    @Test
    fun `should count ternary operator for complexity`() {
        // given
        val fileContent = """const x: number = (y > 0) ? 1 : -1"""
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableMetrics.COMPLEXITY.metricName]).isEqualTo(1)
    }

    @Test
    fun `should count conditional type for complexity`() {
        // given
        val fileContent = """type IsString<T> = T extends string ? true : false;"""
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableMetrics.COMPLEXITY.metricName]).isEqualTo(1)
    }

    @Test
    fun `should count and operator for complexity`() {
        // given
        val fileContent = """if (x === 0 && y < 1) return true"""
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableMetrics.COMPLEXITY.metricName]).isEqualTo(2)
    }

    @Test
    fun `should count nullish operator for complexity`() {
        // given
        val fileContent = """const x: number = y ?? 0"""
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableMetrics.COMPLEXITY.metricName]).isEqualTo(1)
    }

    @Test
    fun `should count switch statement for complexity`() {
        // given
        val fileContent = """
            switch (value) {
                case 1:
                    break;
                case 2:
                    break;
                default:
                    break;
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableMetrics.COMPLEXITY.metricName]).isEqualTo(3)
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
             function helloWorld() {
                 //line comment
                 console.log("Hello"); /* comment in code */ console.log("world")
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
            if (x === 2) {
                // comment


                return true;
            }
        """.trimIndent()
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
            if (x === 2) {
                // comment


                return true;
            }
        """.trimIndent() + "\n" // this newline simulates end of file
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableMetrics.LINES_OF_CODE.metricName]).isEqualTo(6)
    }

    @Test
    fun `should count normal function declaration for number of functions`() {
        // given
        val fileContent = """
            function printSomething() {
                console.log("Something");
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableMetrics.NUMBER_OF_FUNCTIONS.metricName]).isEqualTo(1)
    }

    @Test
    fun `should count generator function declaration for number of functions`() {
        // given
        val fileContent = """
            function* generator() {
                console.log("Returns a generator type");
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableMetrics.NUMBER_OF_FUNCTIONS.metricName]).isEqualTo(1)
    }

    @Test
    fun `should count function expression for number of functions`() {
        // given
        val fileContent = """
            const fun_expr = function (expression: String) {
                console.log("This is a function expression:" + expression);
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableMetrics.NUMBER_OF_FUNCTIONS.metricName]).isEqualTo(1)
    }

    @Test
    fun `should count arrow functions only for number of functions only when they are assigned to a variable`() {
        // given
        val fileContent = """
            const tester = (content: String) => {
                console.log("Logging" + content)
            }

            //inline arrow function (should not be counted)
            const x = ["a", "b", "c"]
            x.map((it) => {console.log(it)})
        """.trimIndent()
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableMetrics.NUMBER_OF_FUNCTIONS.metricName]).isEqualTo(1)
    }

    @Test
    fun `should count method definitions in class for number of functions`() {
        // given
        val fileContent = """
            class TestClass {
                method() {
                    console.log("This is a method")
                }

                // should not count static block in class
                static {
                    console.log("this is a static block")
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
