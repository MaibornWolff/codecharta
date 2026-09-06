package de.maibornwolff.treesitter.excavationsite.languages.go

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterMetrics
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class GoMetricsTest {
    @Test
    fun `should count binary expressions for complexity`() {
        // Arrange
        val code = """
            if x > 0 && y < 10 || z == 5 {
                return true
            }
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.GO)

        // Assert
        assertThat(result.complexity).isEqualTo(3.0)
    }

    @Test
    fun `should count switch statement for complexity`() {
        // Arrange
        val code = """
            switch value {
            case 1:
                break
            case 2:
                break
            default:
                break
            }
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.GO)

        // Assert
        assertThat(result.complexity).isEqualTo(3.0)
    }

    @Test
    fun `should count type switch cases for complexity`() {
        // Arrange
        val code = """
            switch x.(type) {
            case int:
                return 1
            case string:
                return 2
            default:
                return 0
            }
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.GO)

        // Assert
        assertThat(result.complexity).isEqualTo(3.0)
    }

    @Test
    fun `should count cases in select statement for complexity`() {
        // Arrange
        val code = """
            select {
            case <-ch1:
                return 1
            case ch2 <- value:
                return 2
            default:
                return 0
            }
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.GO)

        // Assert
        assertThat(result.complexity).isEqualTo(3.0)
    }

    @Test
    fun `should count function literal for complexity`() {
        // Arrange
        val code = """add := func(x, y int) int { return x + y }"""

        // Act
        val result = TreeSitterMetrics.parse(code, Language.GO)

        // Assert
        assertThat(result.complexity).isEqualTo(1.0)
    }

    @Test
    fun `should count line and block comments for comment_lines`() {
        // Arrange
        val code = """
            /**
             * Block comment
             * over
             * multiple lines
             */
             func helloWorld() {
                 // line comment
                 fmt.Println("Hello") /* comment in code */ fmt.Println("world")
             }
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.GO)

        // Assert
        assertThat(result.commentLines).isEqualTo(7.0)
    }

    @Test
    fun `should not include comments or empty lines for rloc`() {
        // Arrange
        val code = """
            if x == 2 {
                // comment


                return true
            }
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.GO)

        // Assert
        assertThat(result.realLinesOfCode).isEqualTo(3.0)
    }

    @Test
    fun `should count empty lines and comments for loc`() {
        // Arrange
        val code = """
            if x == 2 {
                // comment


                return true
            }
        """.trimIndent() + "\n"

        // Act
        val result = TreeSitterMetrics.parse(code, Language.GO)

        // Assert
        assertThat(result.linesOfCode).isEqualTo(6.0)
    }

    @Test
    fun `should count normal function declaration for number of functions`() {
        // Arrange
        val code = """
            func add(x int, y int) int {
                return x + y
            }
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.GO)

        // Assert
        assertThat(result.numberOfFunctions).isEqualTo(1.0)
    }

    @Test
    fun `should count function literal for number of functions`() {
        // Arrange
        val code = """
            f := func() {
                fmt.Println("I am a function literal!")
            }
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.GO)

        // Assert
        assertThat(result.numberOfFunctions).isEqualTo(1.0)
    }

    @Test
    fun `should count method declaration for number of functions`() {
        // Arrange
        val code = """
            func (v Vertex) Abs() float64 {
                return math.Sqrt(v.X*v.X + v.Y*v.Y)
            }
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.GO)

        // Assert
        assertThat(result.numberOfFunctions).isEqualTo(1.0)
    }

    @Test
    fun `should correctly calculate all measures for parameters per function metric`() {
        // Arrange
        val code = """
            func printSomething() {
                fmt.Println("Something")
            }

            func anotherFun(a int, b int) int {
                return a + b
            }

            func power(x int, y int) int {
                return int(math.Pow(float64(x), float64(y)))
            }

            func oneParameter(x int) int {
                return x * 2
            }
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.GO)

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
            func noComplexity() {
                fmt.Println("hello")
            }

            func complexFun(a int, b int) int {
                switch a {
                case 1:
                    if a*b > 10 {
                        break
                    }
                case 2:
                    if (a+b)%2 == 0 {
                        fmt.Println("Sum is even")
                        break
                    }
                default:
                    return a
                }
                return b
            }

            func isEven(x int) bool {
                if x%2 == 0 {
                    return true
                } else {
                    return false
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.GO)

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
            func functionOne() {
            // comment at start of function
                fmt.Println("This is function one")
                // inline comment
                {}
            }

            func functionTwo(x int) int {
                return x * 2
            }
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.GO)

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
        val result = TreeSitterMetrics.parse(code, Language.GO)

        // Assert
        assertThat(result.messageChains).isEqualTo(1.0)
    }

    @Test
    fun `should count LOC correctly for code without trailing newline`() {
        // Arrange - 3 physical lines
        val code = """
            a := 1
            b := 2
            c := 3
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.GO)

        // Assert - LOC equals RLOC for code without blanks or comments
        assertThat(result.linesOfCode).isEqualTo(3.0)
        assertThat(result.realLinesOfCode).isEqualTo(3.0)
    }
}
