package de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors

import de.maibornwolff.treesitter.excavationsite.api.AvailableFileMetrics
import de.maibornwolff.treesitter.excavationsite.api.Language
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.Test
import java.io.File

class BashCollectorTest {
    private val collector = TreeSitterLibraryCollector(Language.BASH)

    private fun createTestFile(content: String): File {
        val tempFile = File.createTempFile("testFile", ".txt")
        tempFile.writeText(content)
        tempFile.deleteOnExit()
        return tempFile
    }

    @Test
    fun `should count if anf elif for complexity`() {
        // given
        val fileContent = """
            if [ "${'$'}1" -eq 1 ]; then
                echo "one"
            elif [ "${'$'}1" -eq 2 ]; then
                echo "two"
            else
                echo "other"
            fi
        """.trimIndent()
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableFileMetrics.COMPLEXITY.metricName]).isEqualTo(2.0)
    }

    @Test
    fun `should count for loop for complexity`() {
        // given
        val fileContent = """
            for i in {1..10}; do
                echo ${'$'}i
            done
        """.trimIndent()
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableFileMetrics.COMPLEXITY.metricName]).isEqualTo(1.0)
    }

    @Test
    fun `should count c style for loop for complexity`() {
        // given
        val fileContent = """
            for ((i=0; i<10; i++)); do
                echo ${'$'}i
            done
        """.trimIndent()
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableFileMetrics.COMPLEXITY.metricName]).isEqualTo(1.0)
    }

    @Test
    fun `should count while loop for complexity`() {
        // given
        val fileContent = """
            while [ ${'$'}counter -lt 10 ]; do
                echo ${'$'}counter
                ((counter++))
            done
        """.trimIndent()
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableFileMetrics.COMPLEXITY.metricName]).isEqualTo(1.0)
    }

    @Test
    fun `should count ternary operator for complexity`() {
        // given
        val fileContent = """(( x = y > 0 ? 1 : -1 ))"""
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableFileMetrics.COMPLEXITY.metricName]).isEqualTo(1.0)
    }

    @Test
    fun `should count list expression for complexity`() {
        // given
        val fileContent = """command1 && command2 || command3"""
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableFileMetrics.COMPLEXITY.metricName]).isEqualTo(2.0)
    }

    @Test
    fun `should count case statement for complexity`() {
        // given
        val fileContent = """
            case ${'$'}1 in
                start)
                    echo "Starting" ;;
                stop)
                    echo "Stopping" ;;
                *)
                    echo "Usage: ${'$'}0 {start|stop}" ;;
            esac
        """.trimIndent()
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableFileMetrics.COMPLEXITY.metricName]).isEqualTo(3.0)
    }

    @Test
    fun `should count function definition for complexity`() {
        // given
        val fileContent = """
            function greet() {
                echo "Hello, ${'$'}1!"
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
            #!/bin/bash
            # This is a single line comment
            echo "Hello World"

            # Another comment
            # Multi-line
            # comment block
            echo "End"
        """.trimIndent()
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableFileMetrics.COMMENT_LINES.metricName]).isEqualTo(5.0)
    }

    @Test
    fun `should not include comments or empty lines for rloc`() {
        // given
        val fileContent = """
            if [ "${'$'}x" -eq 2 ]; then
                # comment


                echo "true"
            fi
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
            if [ "${'$'}x" -eq 2 ]; then
                # comment


                echo "true"
            fi
        """.trimIndent() + "\n" // this newline simulates end of file
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableFileMetrics.LINES_OF_CODE.metricName]).isEqualTo(6.0)
    }

    @Test
    fun `should count both versions of function definitions for number of functions`() {
        // given
        val fileContent = """
            first_function () {
              echo "something"
            }

            function other_function {
              echo "something else"
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
            print_something () {
              echo "Something"
            }

            function another_fun () {
              echo "$((${'$'}1 + ${'$'}2))"
            }

            function power () {
              echo "$((${'$'}1 ** ${'$'}2))"
            }

            one_parameter () {
              echo "$((${'$'}1 * 2))"
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes["max_parameters_per_function"]).isEqualTo(0.0)
        Assertions.assertThat(result.attributes["min_parameters_per_function"]).isEqualTo(0.0)
        Assertions.assertThat(result.attributes["mean_parameters_per_function"]).isEqualTo(0.0)
        Assertions.assertThat(result.attributes["median_parameters_per_function"]).isEqualTo(0.0)
    }

    @Test
    fun `should correctly calculate all measures for complexity per function metric`() {
        // given
        val fileContent = """
            no_complexity() {
                echo "hello"
            }

            complex_fun() {
                case ${'$'}1 in
                    1)
                        if [ ${'$'}(((${'$'}1 * ${'$'}2)) -gt 10 ] ]; then
                            return
                        fi
                        ;;
                    2)
                        if [ ${'$'}(((${'$'}1 + ${'$'}2) % 2)) -eq 0 ]; then
                            echo "Sum is even"
                            return
                        fi
                        ;;
                    *)
                        echo "default"
                        ;;
                esac
            }

            is_even() {
                if [ ${'$'}((${'$'}1 % 2)) -eq 0 ]; then
                    echo "true"
                else
                    echo "false"
                fi
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes["max_complexity_per_function"]).isEqualTo(3.0)
        Assertions.assertThat(result.attributes["min_complexity_per_function"]).isEqualTo(0.0)
        Assertions.assertThat(result.attributes["mean_complexity_per_function"]).isEqualTo(1.33)
        Assertions.assertThat(result.attributes["median_complexity_per_function"]).isEqualTo(1.0)
    }

    @Test
    fun `should correctly calculate rloc per function metric`() {
        // given
        val fileContent = """
            function_one() {
            # comment at start of function
                echo "This is function one"
                # inline comment
                :
            }

            function_two() {
                echo "This is function two"
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
