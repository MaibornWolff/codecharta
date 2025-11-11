package de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors

import de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes.AvailableFileMetrics
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.treesitter.TSParser
import org.treesitter.TreeSitterPython
import java.io.File

class PythonCollectorTest {
    private var parser = TSParser()
    private val collector = PythonCollector()

    @BeforeEach
    fun setUp() {
        parser.setLanguage(TreeSitterPython())
    }

    private fun createTestFile(content: String): File {
        val tempFile = File.createTempFile("testFile", ".txt")
        tempFile.writeText(content)
        tempFile.deleteOnExit()
        return tempFile
    }

    @Test
    fun `should count lambda expressions for complexity`() {
        // given
        val fileContent = """x = lambda a : a * 5"""
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableFileMetrics.COMPLEXITY.metricName]).isEqualTo(1.0)
    }

    @Test
    fun `should count for in loop for complexity`() {
        // given
        val fileContent = """
            for x in y:
                result += x
        """.trimIndent()
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableFileMetrics.COMPLEXITY.metricName]).isEqualTo(1.0)
    }

    @Test
    fun `should count 'and' and 'or' patterns for complexity`() {
        // given
        val fileContent = """
            if (x == 2 or y != none and y < 5):
                print("")
        """.trimIndent()
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableFileMetrics.COMPLEXITY.metricName]).isEqualTo(3.0)
    }

    @Test
    fun `should count case pattern for complexity`() {
        // given
        val fileContent = """
            match lang:
                case "JavaScript":
                    print("You can become a web developer.")
                case "Python":
                    print("You can become a Data Scientist")
                case _:
                    print("The language doesn't matter, what matters is solving problems.")
        """.trimIndent()
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableFileMetrics.COMPLEXITY.metricName]).isEqualTo(3.0)
    }

    @Test
    fun `should count line and block comments for comment_lines`() {
        // given
        val fileContent = """
            # line comment
            ${"\"\"\""}
            unassigned string used as block comment
            ${"\"\"\""}
        """.trimIndent()
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableFileMetrics.COMMENT_LINES.metricName]).isEqualTo(4.0)
    }

    @Test
    fun `should count assigned multiline strings for rloc`() {
        // given
        val fileContent = """
            x = ${"\"\"\""}
                normal assigned string
            ${"\"\"\""}
        """.trimIndent()
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableFileMetrics.REAL_LINES_OF_CODE.metricName]).isEqualTo(3.0)
    }

    @Test
    fun `should not count unassigned multiline strings for rloc`() {
        // given
        val fileContent = """
            ${"\"\"\""}
            unassigned string, used as block comment
            ${"\"\"\""}
        """.trimIndent()
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableFileMetrics.COMPLEXITY.metricName]).isEqualTo(0.0)
    }

    @Test
    fun `should not include comments or empty lines for rloc`() {
        // given
        val fileContent = """
            ${"\"\"\""}
            unassigned string, used as block comment
            ${"\"\"\""}

            if (x == 2 or y != none and y < 5):
                # prints x

                print(x) # inline comment
        """.trimIndent()
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableFileMetrics.REAL_LINES_OF_CODE.metricName]).isEqualTo(2.0)
    }

    @Test
    fun `should count empty lines and comments for loc`() {
        // given
        val fileContent = """
        ${"\"\"\""}
        unassigned string, used as block comment
        ${"\"\"\""}

        if (x == 2 or y != none and y < 5):
            # prints x

            print(x) # inline comment
        """.trimIndent() + "\n" // this newline simulates end of file
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableFileMetrics.LINES_OF_CODE.metricName]).isEqualTo(8.0)
    }

    @Test
    fun `should count function declaration for number of functions`() {
        // given
        val fileContent = """
            def my_function():
                print("Hello from a function")
        """.trimIndent()
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableFileMetrics.NUMBER_OF_FUNCTIONS.metricName]).isEqualTo(1.0)
    }

    @Test
    fun `should count lambda functions for number of functions only when they are assigned to a variable`() {
        // given
        val fileContent = """
            myLambda = lambda x, y: x + y

            list(map(lambda n: n * 2, [1, 2, 3, 4, 5]))
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
            def print_something():
                print("Something")

            def another_fun(a, b):
                return a + b

            def power(x, y):
                return x ** y

            def one_parameter(x):
                return x * 2
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
            def no_complexity():
                print("hello")

            def complex_fun(a, b):
                match a * b:
                    case x if x > 10:
                        return a
                    case x if x % 2 == 0:
                        print("Is even")
                        return b
                    case _:
                        return 0

            def is_even(x):
                return True if x % 2 == 0 else False
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
            def function_one():
            # comment at start of function
                print("This is function one")
                # inline comment
                pass

            def function_two(x):
                return x * 2
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

    @Test
    fun `should detect message chains with 4 or more method calls`() {
        // given
        val fileContent = """obj.a().field.b().c().d()"""
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableFileMetrics.MESSAGE_CHAINS.metricName]).isEqualTo(1.0)
    }
}
