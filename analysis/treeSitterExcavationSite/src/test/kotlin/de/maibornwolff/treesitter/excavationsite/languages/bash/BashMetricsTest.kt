package de.maibornwolff.treesitter.excavationsite.languages.bash

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterMetrics
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class BashMetricsTest {
    @Test
    fun `should count if anf elif for complexity`() {
        // Arrange
        val code = """
            if [ "${'$'}1" -eq 1 ]; then
                echo "one"
            elif [ "${'$'}1" -eq 2 ]; then
                echo "two"
            else
                echo "other"
            fi
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.BASH)

        // Assert
        assertThat(result.complexity).isEqualTo(2.0)
    }

    @Test
    fun `should count for loop for complexity`() {
        // Arrange
        val code = """
            for i in {1..10}; do
                echo ${'$'}i
            done
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.BASH)

        // Assert
        assertThat(result.complexity).isEqualTo(1.0)
    }

    @Test
    fun `should count c style for loop for complexity`() {
        // Arrange
        val code = """
            for ((i=0; i<10; i++)); do
                echo ${'$'}i
            done
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.BASH)

        // Assert
        assertThat(result.complexity).isEqualTo(1.0)
    }

    @Test
    fun `should count while loop for complexity`() {
        // Arrange
        val code = """
            while [ ${'$'}counter -lt 10 ]; do
                echo ${'$'}counter
                ((counter++))
            done
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.BASH)

        // Assert
        assertThat(result.complexity).isEqualTo(1.0)
    }

    @Test
    fun `should count ternary operator for complexity`() {
        // Arrange
        val code = """(( x = y > 0 ? 1 : -1 ))"""

        // Act
        val result = TreeSitterMetrics.parse(code, Language.BASH)

        // Assert
        assertThat(result.complexity).isEqualTo(1.0)
    }

    @Test
    fun `should count list expression for complexity`() {
        // Arrange
        val code = """command1 && command2 || command3"""

        // Act
        val result = TreeSitterMetrics.parse(code, Language.BASH)

        // Assert
        assertThat(result.complexity).isEqualTo(2.0)
    }

    @Test
    fun `should count case statement for complexity`() {
        // Arrange
        val code = """
            case ${'$'}1 in
                start)
                    echo "Starting" ;;
                stop)
                    echo "Stopping" ;;
                *)
                    echo "Usage: ${'$'}0 {start|stop}" ;;
            esac
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.BASH)

        // Assert
        assertThat(result.complexity).isEqualTo(3.0)
    }

    @Test
    fun `should count function definition for complexity`() {
        // Arrange
        val code = """
            function greet() {
                echo "Hello, ${'$'}1!"
            }
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.BASH)

        // Assert
        assertThat(result.complexity).isEqualTo(1.0)
    }

    @Test
    fun `should count line and block comments for comment_lines`() {
        // Arrange
        val code = """
            #!/bin/bash
            # This is a single line comment
            echo "Hello World"

            # Another comment
            # Multi-line
            # comment block
            echo "End"
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.BASH)

        // Assert
        assertThat(result.commentLines).isEqualTo(5.0)
    }

    @Test
    fun `should not include comments or empty lines for rloc`() {
        // Arrange
        val code = """
            if [ "${'$'}x" -eq 2 ]; then
                # comment


                echo "true"
            fi
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.BASH)

        // Assert
        assertThat(result.realLinesOfCode).isEqualTo(3.0)
    }

    @Test
    fun `should count empty lines and comments for loc`() {
        // Arrange
        val code = """
            if [ "${'$'}x" -eq 2 ]; then
                # comment


                echo "true"
            fi
        """.trimIndent() + "\n"

        // Act
        val result = TreeSitterMetrics.parse(code, Language.BASH)

        // Assert
        assertThat(result.linesOfCode).isEqualTo(6.0)
    }

    @Test
    fun `should count both versions of function definitions for number of functions`() {
        // Arrange
        val code = """
            first_function () {
              echo "something"
            }

            function other_function {
              echo "something else"
            }
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.BASH)

        // Assert
        assertThat(result.numberOfFunctions).isEqualTo(2.0)
    }

    @Test
    fun `should correctly calculate all measures for parameters per function metric`() {
        // Arrange
        val code = """
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

        // Act
        val result = TreeSitterMetrics.parse(code, Language.BASH)

        // Assert
        assertThat(result.perFunctionMetrics["max_parameters_per_function"]).isEqualTo(0.0)
        assertThat(result.perFunctionMetrics["min_parameters_per_function"]).isEqualTo(0.0)
        assertThat(result.perFunctionMetrics["mean_parameters_per_function"]).isEqualTo(0.0)
        assertThat(result.perFunctionMetrics["median_parameters_per_function"]).isEqualTo(0.0)
    }

    @Test
    fun `should correctly calculate all measures for complexity per function metric`() {
        // Arrange
        val code = """
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

        // Act
        val result = TreeSitterMetrics.parse(code, Language.BASH)

        // Assert
        assertThat(result.perFunctionMetrics["max_complexity_per_function"]).isEqualTo(3.0)
        assertThat(result.perFunctionMetrics["min_complexity_per_function"]).isEqualTo(0.0)
        assertThat(result.perFunctionMetrics["mean_complexity_per_function"]).isEqualTo(1.33)
        assertThat(result.perFunctionMetrics["median_complexity_per_function"]).isEqualTo(1.0)
    }

    @Test
    fun `should correctly calculate rloc per function metric`() {
        // Arrange
        val code = """
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

        // Act
        val result = TreeSitterMetrics.parse(code, Language.BASH)

        // Assert
        assertThat(result.perFunctionMetrics["max_rloc_per_function"]).isEqualTo(2.0)
        assertThat(result.perFunctionMetrics["min_rloc_per_function"]).isEqualTo(1.0)
        assertThat(result.perFunctionMetrics["mean_rloc_per_function"]).isEqualTo(1.5)
        assertThat(result.perFunctionMetrics["median_rloc_per_function"]).isEqualTo(1.5)
    }

    @Test
    fun `should count LOC correctly for code without trailing newline`() {
        // Arrange - 3 physical lines
        val code = """
            a=1
            b=2
            c=3
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.BASH)

        // Assert - LOC equals RLOC for code without blanks or comments
        assertThat(result.linesOfCode).isEqualTo(3.0)
        assertThat(result.realLinesOfCode).isEqualTo(3.0)
    }
}
