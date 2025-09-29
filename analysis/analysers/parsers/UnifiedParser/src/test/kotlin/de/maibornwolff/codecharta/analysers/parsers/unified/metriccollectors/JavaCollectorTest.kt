package de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors

import de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes.AvailableFileMetrics
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.treesitter.TSParser
import org.treesitter.TreeSitterJava
import java.io.File

class JavaCollectorTest {
    private var parser = TSParser()
    private val collector = JavaCollector()

    @BeforeEach
    fun setUp() {
        parser.setLanguage(TreeSitterJava())
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
        val fileContent = """int sum = (int x, int y) -> x + y;"""
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableFileMetrics.COMPLEXITY.metricName]).isEqualTo(1.0)
    }

    @Test
    fun `should count ternary operator for complexity`() {
        // given
        val fileContent = """x = (y>0) ? 1 : -1;"""
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableFileMetrics.COMPLEXITY.metricName]).isEqualTo(1.0)
    }

    @Test
    fun `should count enhanced for loop for complexity`() {
        // given
        val fileContent = """
            for (char item: vowels) {
                System.out.println(item);
            }
        """.trimIndent()
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
             * docstring comment
             * over
             * multiple lines
             */
            public void helloWorld() {
                // line comment
                System.out.println("Hello"); /* comment in code */ System.out.println("world");
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


                return true;
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
            if (x == 2) {
                // comment


                return true;
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
            public void testFun() {
                System.out.println("normal method declaration");
            }
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
            // Lambda assigned to a variable (should be counted)
            java.util.function.Consumer<String> tester = (content) -> {
                System.out.println("Logging" + content);
            };

            // Inline lambda in method call (should not be counted)
            java.util.List<String> x = java.util.Arrays.asList("a", "b", "c");
            x.forEach((it) -> { System.out.println(it); });
        """.trimIndent()
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableFileMetrics.NUMBER_OF_FUNCTIONS.metricName]).isEqualTo(1.0)
    }

    @Test
    fun `should count constructor and compact constructor for number of functions`() {
        // given
        val fileContent = """
            public class Main {
                int x;

                public Main() { // normal constructor
                    x = 5;
                }

                Main { // compact constructor
                    x = 6
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
    fun `should correctly calculate all measures for parameters per function metric`() {
        // given
        val fileContent = """
            public void printSomething() {
                System.out.println("Something");
            }

            public int anotherFun(int a, int b) {
                return a + b;
            }

            public int power(int x, int y) {
                return (int) Math.pow(x, y);
            }

            public int oneParameter(int x) {
                return x * 2;
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
