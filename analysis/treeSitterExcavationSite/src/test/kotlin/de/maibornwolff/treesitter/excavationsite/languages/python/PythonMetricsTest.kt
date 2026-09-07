package de.maibornwolff.treesitter.excavationsite.languages.python

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterMetrics
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class PythonMetricsTest {
    @Test
    fun `should count lambda expressions for complexity`() {
        // Arrange
        val code = """x = lambda a : a * 5"""

        // Act
        val result = TreeSitterMetrics.parse(code, Language.PYTHON)

        // Assert
        assertThat(result.complexity).isEqualTo(1.0)
    }

    @Test
    fun `should count for in loop for complexity`() {
        // Arrange
        val code = """
            for x in y:
                result += x
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.PYTHON)

        // Assert
        assertThat(result.complexity).isEqualTo(1.0)
    }

    @Test
    fun `should count 'and' and 'or' patterns for complexity`() {
        // Arrange
        val code = """
            if (x == 2 or y != none and y < 5):
                print("")
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.PYTHON)

        // Assert
        assertThat(result.complexity).isEqualTo(3.0)
    }

    @Test
    fun `should count case pattern for complexity`() {
        // Arrange
        val code = """
            match lang:
                case "JavaScript":
                    print("You can become a web developer.")
                case "Python":
                    print("You can become a Data Scientist")
                case _:
                    print("The language doesn't matter, what matters is solving problems.")
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.PYTHON)

        // Assert
        assertThat(result.complexity).isEqualTo(3.0)
    }

    @Test
    fun `should count line and block comments for comment_lines`() {
        // Arrange
        val code = """
            # line comment
            ${"\"\"\""}
            unassigned string used as block comment
            ${"\"\"\""}
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.PYTHON)

        // Assert
        assertThat(result.commentLines).isEqualTo(4.0)
    }

    @Test
    fun `should count assigned multiline strings for rloc`() {
        // Arrange
        val code = """
            x = ${"\"\"\""}
                normal assigned string
            ${"\"\"\""}
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.PYTHON)

        // Assert
        assertThat(result.realLinesOfCode).isEqualTo(3.0)
    }

    @Test
    fun `should not count unassigned multiline strings for rloc`() {
        // Arrange
        val code = """
            ${"\"\"\""}
            unassigned string, used as block comment
            ${"\"\"\""}
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.PYTHON)

        // Assert
        assertThat(result.complexity).isEqualTo(0.0)
    }

    @Test
    fun `should not include comments or empty lines for rloc`() {
        // Arrange
        val code = """
            ${"\"\"\""}
            unassigned string, used as block comment
            ${"\"\"\""}

            if (x == 2 or y != none and y < 5):
                # prints x

                print(x) # inline comment
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.PYTHON)

        // Assert
        assertThat(result.realLinesOfCode).isEqualTo(2.0)
    }

    @Test
    fun `should count empty lines and comments for loc`() {
        // Arrange
        val code = """
        ${"\"\"\""}
        unassigned string, used as block comment
        ${"\"\"\""}

        if (x == 2 or y != none and y < 5):
            # prints x

            print(x) # inline comment
        """.trimIndent() + "\n"

        // Act
        val result = TreeSitterMetrics.parse(code, Language.PYTHON)

        // Assert
        assertThat(result.linesOfCode).isEqualTo(8.0)
    }

    @Test
    fun `should count function declaration for number of functions`() {
        // Arrange
        val code = """
            def my_function():
                print("Hello from a function")
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.PYTHON)

        // Assert
        assertThat(result.numberOfFunctions).isEqualTo(1.0)
    }

    @Test
    fun `should count lambda functions for number of functions only when they are assigned to a variable`() {
        // Arrange
        val code = """
            myLambda = lambda x, y: x + y

            list(map(lambda n: n * 2, [1, 2, 3, 4, 5]))
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.PYTHON)

        // Assert
        assertThat(result.numberOfFunctions).isEqualTo(1.0)
    }

    @Test
    fun `should correctly calculate all measures for parameters per function metric`() {
        // Arrange
        val code = """
            def print_something():
                print("Something")

            def another_fun(a, b):
                return a + b

            def power(x, y):
                return x ** y

            def one_parameter(x):
                return x * 2
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.PYTHON)

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

        // Act
        val result = TreeSitterMetrics.parse(code, Language.PYTHON)

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
            def function_one():
            # comment at start of function
                print("This is function one")
                # inline comment
                pass

            def function_two(x):
                return x * 2
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.PYTHON)

        // Assert
        assertThat(result.perFunctionMetrics["max_rloc_per_function"]).isEqualTo(2.0)
        assertThat(result.perFunctionMetrics["min_rloc_per_function"]).isEqualTo(1.0)
        assertThat(result.perFunctionMetrics["mean_rloc_per_function"]).isEqualTo(1.5)
        assertThat(result.perFunctionMetrics["median_rloc_per_function"]).isEqualTo(1.5)
    }

    @Test
    fun `should detect message chains with 4 or more method calls`() {
        // Arrange
        val code = """obj.a().field.b().c().d()"""

        // Act
        val result = TreeSitterMetrics.parse(code, Language.PYTHON)

        // Assert
        assertThat(result.messageChains).isEqualTo(1.0)
    }

    @Test
    fun `should count LOC correctly for code without trailing newline`() {
        // Arrange - 3 physical lines
        val code = """
            a = 1
            b = 2
            c = 3
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.PYTHON)

        // Assert - LOC equals RLOC for code without blanks or comments
        assertThat(result.linesOfCode).isEqualTo(3.0)
        assertThat(result.realLinesOfCode).isEqualTo(3.0)
    }
}
