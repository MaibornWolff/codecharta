package de.maibornwolff.treesitter.excavationsite.languages.javascript

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterMetrics
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class JavascriptMetricsTest {
    @Test
    fun `should count for in loop for complexity`() {
        // Arrange
        val code = """
                for (let x in person) {
                  text += person[x];
                }
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.JAVASCRIPT)

        // Assert
        assertThat(result.complexity).isEqualTo(1.0)
    }

    @Test
    fun `should count ternary operator for complexity`() {
        // Arrange
        val code = """x = (y>0) ? 1 : -1;"""

        // Act
        val result = TreeSitterMetrics.parse(code, Language.JAVASCRIPT)

        // Assert
        assertThat(result.complexity).isEqualTo(1.0)
    }

    @Test
    fun `should count and operator for complexity`() {
        // Arrange
        val code = """if (x == 0 && y < 1) return true"""

        // Act
        val result = TreeSitterMetrics.parse(code, Language.JAVASCRIPT)

        // Assert
        assertThat(result.complexity).isEqualTo(2.0)
    }

    @Test
    fun `should count nullish operator for complexity`() {
        // Arrange
        val code = """x = y ?? 0"""

        // Act
        val result = TreeSitterMetrics.parse(code, Language.JAVASCRIPT)

        // Assert
        assertThat(result.complexity).isEqualTo(1.0)
    }

    @Test
    fun `should count switch statement for complexity`() {
        // Arrange
        val code = """
            switch (value) {
                case 1:
                    break;
                case 2:
                    break;
                default:
                    break;
            }
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.JAVASCRIPT)

        // Assert
        assertThat(result.complexity).isEqualTo(3.0)
    }

    @Test
    fun `should count line and block comments for comment_lines`() {
        // Arrange
        val code = """
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

        // Act
        val result = TreeSitterMetrics.parse(code, Language.JAVASCRIPT)

        // Assert
        assertThat(result.commentLines).isEqualTo(7.0)
    }

    @Test
    fun `should not include comments or empty lines for rloc`() {
        // Arrange
        val code = """
            if (x == 2) {
                // comment


                return true
            }
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.JAVASCRIPT)

        // Assert
        assertThat(result.realLinesOfCode).isEqualTo(3.0)
    }

    @Test
    fun `should count empty lines and comments for loc`() {
        // Arrange
        val code = """
            if (x == 2) {
            // comment


            return true;
            }
        """.trimIndent() + "\n"

        // Act
        val result = TreeSitterMetrics.parse(code, Language.JAVASCRIPT)

        // Assert
        assertThat(result.linesOfCode).isEqualTo(6.0)
    }

    @Test
    fun `should count normal function declaration for number of functions`() {
        // Arrange
        val code = """
            function printSomething() {
                console.log("Something");
            }
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.JAVASCRIPT)

        // Assert
        assertThat(result.numberOfFunctions).isEqualTo(1.0)
    }

    @Test
    fun `should count generator function declaration for number of functions`() {
        // Arrange
        val code = """
            function* generator() {
                console.log("Returns a generator type");
            }
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.JAVASCRIPT)

        // Assert
        assertThat(result.numberOfFunctions).isEqualTo(1.0)
    }

    @Test
    fun `should count function expression for number of functions`() {
        // Arrange
        val code = """
            const fun_expr = function (expression) {
                console.log("This is a function expression:" + expression);
            }
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.JAVASCRIPT)

        // Assert
        assertThat(result.numberOfFunctions).isEqualTo(1.0)
    }

    @Test
    fun `should count arrow functions only for number of functions only when they are assigned to a variable`() {
        // Arrange
        val code = """
            const tester = (content) => {
                console.log("Logging" + content)
            }

            //inline arrow function (should not be counted)
            const x = ["a", "b", "c"]
            x.map((it) => {console.log(it)})
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.JAVASCRIPT)

        // Assert
        assertThat(result.numberOfFunctions).isEqualTo(1.0)
    }

    @Test
    fun `should count method definitions in class for number of functions`() {
        // Arrange
        val code = """
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

        // Act
        val result = TreeSitterMetrics.parse(code, Language.JAVASCRIPT)

        // Assert
        assertThat(result.numberOfFunctions).isEqualTo(1.0)
    }

    @Test
    fun `should correctly calculate all measures for parameters per function metric`() {
        // Arrange
        val code = """
            function printSomething() {
                console.log("Something");
            }

            function anotherFun(a, b) {
                return a + b;
            }

            function power(x, y) {
                return x ** y;
            }

            function oneParameter(x) {
                return x * 2;
            }
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.JAVASCRIPT)

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
            function noComplexity() {
                console.log("hello");
            }

            function complexFun(a, b) {
                switch (true) {
                    case (a * b > 10):
                        break;
                    case ((a + b) % 2 === 0):
                        console.log("Sum is even");
                        break;
                    default:
                        return;
                }
            }

            function isEven(x) {
                return (x % 2 === 0) ? true : false;
            }
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.JAVASCRIPT)

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
            function functionOne() {
            // comment at start of function
                console.log("This is function one");
                // inline comment
                {}
            }

            function functionTwo(x) {
                return x * 2;
            }
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.JAVASCRIPT)

        // Assert
        assertThat(result.perFunctionMetrics["max_rloc_per_function"]).isEqualTo(2.0)
        assertThat(result.perFunctionMetrics["min_rloc_per_function"]).isEqualTo(1.0)
        assertThat(result.perFunctionMetrics["mean_rloc_per_function"]).isEqualTo(1.5)
        assertThat(result.perFunctionMetrics["median_rloc_per_function"]).isEqualTo(1.5)
    }

    @Test
    fun `should detect message chains with 4 or more method calls`() {
        // Arrange
        val code = """obj.a().field.b().c().d();"""

        // Act
        val result = TreeSitterMetrics.parse(code, Language.JAVASCRIPT)

        // Assert
        assertThat(result.messageChains).isEqualTo(1.0)
    }

    @Test
    fun `should count LOC correctly for code without trailing newline`() {
        // Arrange - 3 physical lines
        val code = """
            const a = 1;
            const b = 2;
            const c = 3;
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.JAVASCRIPT)

        // Assert - LOC equals RLOC for code without blanks or comments
        assertThat(result.linesOfCode).isEqualTo(3.0)
        assertThat(result.realLinesOfCode).isEqualTo(3.0)
    }
}
