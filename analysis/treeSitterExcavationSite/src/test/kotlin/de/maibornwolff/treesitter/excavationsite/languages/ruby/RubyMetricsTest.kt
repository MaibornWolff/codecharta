package de.maibornwolff.treesitter.excavationsite.languages.ruby

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterMetrics
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class RubyMetricsTest {
    @Test
    fun `should count if and elsif for complexity`() {
        // Arrange
        val code = """
            if x == 1
                puts "one"
            elsif x == 2
                puts "two"
            else
                puts "other"
            end
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.RUBY)

        // Assert
        assertThat(result.complexity).isEqualTo(2.0)
    }

    @Test
    fun `should count 'and' and 'or' patterns for complexity`() {
        // Arrange
        val code = """if obj.is_a?(String) and !obj.nil?; end"""

        // Act
        val result = TreeSitterMetrics.parse(code, Language.RUBY)

        // Assert
        assertThat(result.complexity).isEqualTo(2.0)
    }

    @Test
    fun `should count binary expressions with && operator for complexity`() {
        // Arrange
        val code = """if x > 0 && y < 10; end"""

        // Act
        val result = TreeSitterMetrics.parse(code, Language.RUBY)

        // Assert
        assertThat(result.complexity).isEqualTo(2.0)
    }

    @Test
    fun `should count for loops for complexity`() {
        // Arrange
        val code = """
            for i in 1..5
                puts i
            end
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.RUBY)

        // Assert
        assertThat(result.complexity).isEqualTo(1.0)
    }

    @Test
    fun `should count while loops for complexity`() {
        // Arrange
        val code = """
            while x < 10
                x += 1
            end
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.RUBY)

        // Assert
        assertThat(result.complexity).isEqualTo(1.0)
    }

    @Test
    fun `should count do blocks for complexity`() {
        // Arrange
        val code = """
            [1, 2, 3].each do |num|
                puts num * 2
            end
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.RUBY)

        // Assert
        assertThat(result.complexity).isEqualTo(1.0)
    }

    @Test
    fun `should count until loop for complexity`() {
        // Arrange
        val code = """
            i = 0
            until i >= 5
                puts i
                i += 1
            end
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.RUBY)

        // Assert
        assertThat(result.complexity).isEqualTo(1.0)
    }

    @Test
    fun `should count when case for complexity`() {
        // Arrange
        val code = """
            case value
            when 1
                puts "one"
            when 2
                puts "two"
            else
                puts "other"
            end
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.RUBY)

        // Assert
        assertThat(result.complexity).isEqualTo(3.0)
    }

    @Test
    fun `should count rescue statement for complexity`() {
        // Arrange
        val code = """
            begin
                puts "trying something risky"
                raise "error"
            rescue StandardError => e
                puts "caught error: #{e.message}"
            end
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.RUBY)

        // Assert
        assertThat(result.complexity).isEqualTo(1.0)
    }

    @Test
    fun `should count lambda expression for complexity`() {
        // Arrange
        val code = """square = -> { |x| x * x }"""

        // Act
        val result = TreeSitterMetrics.parse(code, Language.RUBY)

        // Assert
        assertThat(result.complexity).isEqualTo(1.0)
    }

    @Test
    fun `should count methods for complexity`() {
        // Arrange
        val code = """
            def greet(name)
                puts "Hello, #{name}!"
            end
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.RUBY)

        // Assert
        assertThat(result.complexity).isEqualTo(1.0)
    }

    @Test
    fun `should count singleton method for complexity`() {
        // Arrange
        val code = """
            class MyClass
                def self.class_method
                    puts "This is a class method"
                end
            end
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.RUBY)

        // Assert
        assertThat(result.complexity).isEqualTo(1.0)
    }

    @Test
    fun `should count line and block comments for comment_lines`() {
        // Arrange
        val code = """
            =begin
            This is a block comment
            over multiple lines
            =end
            def hello_world
                # line comment
                puts "Hello" # inline comment
            end
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.RUBY)

        // Assert
        assertThat(result.commentLines).isEqualTo(6.0)
    }

    @Test
    fun `should not include comments or empty lines for rloc`() {
        // Arrange
        val code = """
            if x == 2
                # comment


                return true
            end
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.RUBY)

        // Assert
        assertThat(result.realLinesOfCode).isEqualTo(3.0)
    }

    @Test
    fun `should count empty lines and comments for loc`() {
        // Arrange
        val code = """
            if x == 2
                # comment


                return true
            end
        """.trimIndent() + "\n"

        // Act
        val result = TreeSitterMetrics.parse(code, Language.RUBY)

        // Assert
        assertThat(result.linesOfCode).isEqualTo(6.0)
    }

    @Test
    fun `should count method definition for number of functions`() {
        // Arrange
        val code = """
            def greet(name)
                puts "Hello, #{name}!"
            end
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.RUBY)

        // Assert
        assertThat(result.numberOfFunctions).isEqualTo(1.0)
    }

    @Test
    fun `should count singleton methods for number of functions`() {
        // Arrange
        val code = """
            def object.singleton_method
              "This is a singleton method"
            end
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.RUBY)

        // Assert
        assertThat(result.numberOfFunctions).isEqualTo(1.0)
    }

    @Test
    fun `should count lambda expression for number of functions`() {
        // Arrange
        val code = """
            a_lambda = -> { puts "Hello world!" }
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.RUBY)

        // Assert
        assertThat(result.numberOfFunctions).isEqualTo(1.0)
    }

    @Test
    fun `should correctly calculate all measures for parameters per function metric`() {
        // Arrange
        val code = """
            def print_something
                puts "Something"
            end

            def another_fun(a, b)
                a + b
            end

            def power(x, y)
                x ** y
            end

            def one_parameter(x)
                x * 2
            end
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.RUBY)

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
            def no_complexity
                puts "hello"
            end

            def complex_fun(a, b)
                case a
                when 1
                    if a * b > 10
                        return a
                    end
                when 2
                    if (a + b) % 2 == 0
                        puts "Sum is even"
                        return b
                    end
                else
                    return 0
                end
            end

            def is_even(x)
                x % 2 == 0 ? true : false
            end
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.RUBY)

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
            def function_one
            # comment at start of function
                puts "This is function one"
                # inline comment
                return
            end

            def function_two(x)
                return x * 2
            end
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.RUBY)

        // Assert
        assertThat(result.perFunctionMetrics["max_rloc_per_function"]).isEqualTo(2.0)
        assertThat(result.perFunctionMetrics["min_rloc_per_function"]).isEqualTo(1.0)
        assertThat(result.perFunctionMetrics["mean_rloc_per_function"]).isEqualTo(1.5)
        assertThat(result.perFunctionMetrics["median_rloc_per_function"]).isEqualTo(1.5)
    }

    @Test
    fun `should detect message chains with 4 or more method calls`() {
        // Arrange
        val code = """obj.a.field.b.c"""

        // Act
        val result = TreeSitterMetrics.parse(code, Language.RUBY)

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
        val result = TreeSitterMetrics.parse(code, Language.RUBY)

        // Assert - LOC equals RLOC for code without blanks or comments
        assertThat(result.linesOfCode).isEqualTo(3.0)
        assertThat(result.realLinesOfCode).isEqualTo(3.0)
    }
}
