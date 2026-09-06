package de.maibornwolff.treesitter.excavationsite.languages.php

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterMetrics
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class PhpMetricsTest {
    @Test
    fun `should count else if clause for complexity`() {
        // Arrange
        val code = """
            <?php
            if (${'$'}x == 1) {
                echo "one";
            } elseif (${'$'}x == 2) {
                echo "two";
            } else {
                echo "other";
            }
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.PHP)

        // Assert
        assertThat(result.complexity).isEqualTo(2.0)
    }

    @Test
    fun `should count foreach statement for complexity`() {
        // Arrange
        val code = """
            <?php
            foreach (${'$'}items as ${'$'}item) {
                echo ${'$'}item;
            }
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.PHP)

        // Assert
        assertThat(result.complexity).isEqualTo(1.0)
    }

    @Test
    fun `should count conditional expression for complexity`() {
        // Arrange
        val code = """<?php ${'$'}x = (${'$'}y > 0) ? 1 : -1; ?>"""

        // Act
        val result = TreeSitterMetrics.parse(code, Language.PHP)

        // Assert
        assertThat(result.complexity).isEqualTo(1.0)
    }

    @Test
    fun `should count 'and' and 'or' patterns for complexity`() {
        // Arrange
        val code = """<?php if (${'$'}x > 0 and ${'$'}y > 0 or ${'$'}z > 0) { echo "test"; } ?>"""

        // Act
        val result = TreeSitterMetrics.parse(code, Language.PHP)

        // Assert
        assertThat(result.complexity).isEqualTo(3.0)
    }

    @Test
    fun `should count binary expressions with && operator for complexity`() {
        // Arrange
        val code = """<?php if (${'$'}x > 0 && ${'$'}y < 10) { echo "test"; } ?>"""

        // Act
        val result = TreeSitterMetrics.parse(code, Language.PHP)

        // Assert
        assertThat(result.complexity).isEqualTo(2.0)
    }

    @Test
    fun `should count null coalescing operator for complexity`() {
        // Arrange
        val code = """<?php ${'$'}result = ${'$'}name ?? "default"; ?>"""

        // Act
        val result = TreeSitterMetrics.parse(code, Language.PHP)

        // Assert
        assertThat(result.complexity).isEqualTo(1.0)
    }

    @Test
    fun `should count case statement for complexity`() {
        // Arrange
        val code = """
            <?php
            switch (${'$'}value) {
                case 1:
                    echo "one";
                    break;
                case 2:
                    echo "two";
                    break;
                default:
                    echo "other";
                    break;
            }
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.PHP)

        // Assert
        assertThat(result.complexity).isEqualTo(3.0)
    }

    @Test
    fun `should count conditional match for complexity`() {
        // Arrange
        val code = """
            <?php
            ${'$'}result = match(${'$'}value) {
                1 => "one",
                2 => "two",
                default => "other"
            };
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.PHP)

        // Assert
        assertThat(result.complexity).isEqualTo(3.0)
    }

    @Test
    fun `should count arrow function for complexity`() {
        // Arrange
        val code = """<?php ${'$'}func = fn(${'$'}a, ${'$'}b) => ${'$'}a + ${'$'}b; ?>"""

        // Act
        val result = TreeSitterMetrics.parse(code, Language.PHP)

        // Assert
        assertThat(result.complexity).isEqualTo(1.0)
    }

    @Test
    fun `should count anonymous function creation for complexity`() {
        // Arrange
        val code = """
            <?php
            ${'$'}func = function(${'$'}x) {
                return ${'$'}x * 2;
            };
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.PHP)

        // Assert
        assertThat(result.complexity).isEqualTo(1.0)
    }

    @Test
    fun `should count static function for complexity`() {
        // Arrange
        val code = """
            <?php
            class MyClass {
                public static function staticMethod() {
                    return "static";
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.PHP)

        // Assert
        assertThat(result.complexity).isEqualTo(1.0)
    }

    @Test
    fun `should count line and block comments for comment_lines`() {
        // Arrange
        val code = """
            <?php
            /**
             * docstring comment
             * over
             * multiple lines
             */
             function helloWorld() {
                 //line comment
                 echo "Hello"; /* comment in code */ echo "world";
             }
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.PHP)

        // Assert
        assertThat(result.commentLines).isEqualTo(7.0)
    }

    @Test
    fun `should not include comments or empty lines for rloc`() {
        // Arrange
        val code = """
            <?php
            if (${'$'}x == 2) {
                // comment


                return true;
            }
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.PHP)

        // Assert
        assertThat(result.realLinesOfCode).isEqualTo(4.0)
    }

    @Test
    fun `should count empty lines and comments for loc`() {
        // Arrange
        val code = """
            <?php
            if (${'$'}x == 2) {
                // comment


                return true;
            }
        """.trimIndent() + "\n"

        // Act
        val result = TreeSitterMetrics.parse(code, Language.PHP)

        // Assert
        assertThat(result.linesOfCode).isEqualTo(7.0)
    }

    @Test
    fun `should count normal function definitions for number of functions`() {
        // Arrange
        val code = """
            <?php
            function myMessage() {
              echo "Hello world!";
            }
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.PHP)

        // Assert
        assertThat(result.numberOfFunctions).isEqualTo(1.0)
    }

    @Test
    fun `should count method definitions in class for number of functions`() {
        // Arrange
        val code = """
            <?php
            class Foo {
                function myMessage() {
                    echo "Hello world!";
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.PHP)

        // Assert
        assertThat(result.numberOfFunctions).isEqualTo(1.0)
    }

    @Test
    fun `should count anonymous function definitions for number of functions only when assigned to a variable`() {
        // Arrange
        val code = """
            <?php
            ${'$'}greet = function(${'$'}name) {
                printf("Hello %s\r\n", ${'$'}name);
            };

            array_map(function(${'$'}name) {
                printf("Hello %s\r\n", ${'$'}name);
            }, ["Alice", "Bob"]);
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.PHP)

        // Assert
        assertThat(result.numberOfFunctions).isEqualTo(1.0)
    }

    @Test
    fun `should count arrow function definitions for number of functions only when assigned to a variable`() {
        // Arrange
        val code = """
            <?php
            ${'$'}double = fn(${'$'}x) => ${'$'}x * 2;

            ${'$'}result = array_map(fn(${'$'}x) => ${'$'}x * 2, [1, 2, 3]);
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.PHP)

        // Assert
        assertThat(result.numberOfFunctions).isEqualTo(1.0)
    }

    @Test
    fun `should correctly calculate all measures for parameters per function metric`() {
        // Arrange
        val code = """
            <?php
            function printSomething() {
                echo "Something";
            }

            function anotherFun(${'$'}a, ${'$'}b) {
                return ${'$'}a + ${'$'}b;
            }

            function power(${'$'}x, ${'$'}y) {
                return pow(${'$'}x, ${'$'}y);
            }

            function oneParameter(${'$'}x) {
                return ${'$'}x * 2;
            }
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.PHP)

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
            <?php
            function noComplexity() {
                echo "hello";
            }

            function complexFun(${'$'}a, ${'$'}b) {
                switch (${'$'}a) {
                    case 1:
                        if (${'$'}a * ${'$'}b > 10) {
                            break;
                        }
                    case 2:
                        if ((${'$'}a + ${'$'}b) % 2 == 0) {
                            echo "Sum is even";
                            break;
                        }
                    default:
                        return ${'$'}a;
                }
                return ${'$'}b;
            }

            function isEven(${'$'}x) {
                return (${'$'}x % 2 == 0) ? true : false;
            }
            ?>
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.PHP)

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
            <?php
            function functionOne() {
            // comment at start of function
                echo "This is function one";
                // inline comment
                {}
            }

            function functionTwo(${'$'}x) {
                return ${'$'}x * 2;
            }
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.PHP)

        // Assert
        assertThat(result.perFunctionMetrics["max_rloc_per_function"]).isEqualTo(2.0)
        assertThat(result.perFunctionMetrics["min_rloc_per_function"]).isEqualTo(1.0)
        assertThat(result.perFunctionMetrics["mean_rloc_per_function"]).isEqualTo(1.5)
        assertThat(result.perFunctionMetrics["median_rloc_per_function"]).isEqualTo(1.5)
    }

    @Test
    fun `should detect message chains with 4 or more method calls`() {
        // Arrange
        val code = """<?php ${'$'}obj->a()->field->b()->c()->d();"""

        // Act
        val result = TreeSitterMetrics.parse(code, Language.PHP)

        // Assert
        assertThat(result.messageChains).isEqualTo(1.0)
    }

    @Test
    fun `should count LOC correctly for code without trailing newline`() {
        // Arrange - 3 physical lines (PHP needs opening tag)
        val code = """
            <?php
            ${'$'}a = 1;
            ${'$'}b = 2;
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.PHP)

        // Assert - LOC equals RLOC for code without blanks or comments
        assertThat(result.linesOfCode).isEqualTo(3.0)
        assertThat(result.realLinesOfCode).isEqualTo(3.0)
    }
}
