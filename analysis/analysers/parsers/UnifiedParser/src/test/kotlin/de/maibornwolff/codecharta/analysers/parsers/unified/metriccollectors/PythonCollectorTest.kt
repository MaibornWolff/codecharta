package de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors

import de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes.AvailableMetrics
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
        Assertions.assertThat(result.attributes[AvailableMetrics.COMPLEXITY.metricName]).isEqualTo(1)
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
        Assertions.assertThat(result.attributes[AvailableMetrics.COMPLEXITY.metricName]).isEqualTo(1)
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
        Assertions.assertThat(result.attributes[AvailableMetrics.COMPLEXITY.metricName]).isEqualTo(3)
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
        Assertions.assertThat(result.attributes[AvailableMetrics.COMPLEXITY.metricName]).isEqualTo(3)
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
        Assertions.assertThat(result.attributes[AvailableMetrics.COMMENT_LINES.metricName]).isEqualTo(4)
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
        Assertions.assertThat(result.attributes[AvailableMetrics.REAL_LINES_OF_CODE.metricName]).isEqualTo(3)
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
        Assertions.assertThat(result.attributes[AvailableMetrics.COMPLEXITY.metricName]).isEqualTo(0)
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
        Assertions.assertThat(result.attributes[AvailableMetrics.REAL_LINES_OF_CODE.metricName]).isEqualTo(2)
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
        Assertions.assertThat(result.attributes[AvailableMetrics.LINES_OF_CODE.metricName]).isEqualTo(8)
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
        Assertions.assertThat(result.attributes[AvailableMetrics.NUMBER_OF_FUNCTIONS.metricName]).isEqualTo(1)
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
        Assertions.assertThat(result.attributes[AvailableMetrics.NUMBER_OF_FUNCTIONS.metricName]).isEqualTo(1)
    }
}
