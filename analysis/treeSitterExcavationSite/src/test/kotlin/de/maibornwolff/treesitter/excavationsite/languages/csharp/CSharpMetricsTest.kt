package de.maibornwolff.treesitter.excavationsite.languages.csharp

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterMetrics
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class CSharpMetricsTest {
    @Test
    fun `should count lambda expressions for complexity`() {
        // Arrange
        val code = """num => num * 5;"""

        // Act
        val result = TreeSitterMetrics.parse(code, Language.CSHARP)

        // Assert
        assertThat(result.complexity).isEqualTo(1.0)
    }

    @Test
    fun `should count conditional expression for complexity`() {
        // Arrange
        val code = """x = (y>0) ? 1 : -1;"""

        // Act
        val result = TreeSitterMetrics.parse(code, Language.CSHARP)

        // Assert
        assertThat(result.complexity).isEqualTo(1.0)
    }

    @Test
    fun `should count 'and' and 'or' patterns for complexity`() {
        // Arrange
        val code = """if (obj is string and not null) { }"""

        // Act
        val result = TreeSitterMetrics.parse(code, Language.CSHARP)

        // Assert
        assertThat(result.complexity).isEqualTo(2.0)
    }

    @Test
    fun `should count binary expressions with && operator for complexity`() {
        // Arrange
        val code = """if (x > 0 && y < 10) { }"""

        // Act
        val result = TreeSitterMetrics.parse(code, Language.CSHARP)

        // Assert
        assertThat(result.complexity).isEqualTo(2.0)
    }

    @Test
    fun `should count null coalescing operator for complexity`() {
        // Arrange
        val code = """string result = name ?? "default";"""

        // Act
        val result = TreeSitterMetrics.parse(code, Language.CSHARP)

        // Assert
        assertThat(result.complexity).isEqualTo(1.0)
    }

    @Test
    fun `should count switch cases for complexity`() {
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
        val result = TreeSitterMetrics.parse(code, Language.CSHARP)

        // Assert
        assertThat(result.complexity).isEqualTo(3.0)
    }

    @Test
    fun `should count switch expression arms for complexity`() {
        // Arrange
        val code = """
            string result = value switch {
                1 => "one",
                2 => "two",
                _ => "other"
            };
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.CSHARP)

        // Assert
        assertThat(result.complexity).isEqualTo(3.0)
    }

    @Test
    fun `should count accessor declarations for complexity`() {
        // Arrange
        val code = """
            public class Example {
                public string Name {
                    get => name;
                    set => name = value;
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.CSHARP)

        // Assert
        assertThat(result.complexity).isEqualTo(2.0)
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
             public void HelloWorld() {
                 //line comment
                 Console.WriteLine("Hello"); /* comment in code */ Console.WriteLine("world");
             }
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.CSHARP)

        // Assert
        assertThat(result.commentLines).isEqualTo(7.0)
    }

    @Test
    fun `should not include comments or empty lines for rloc`() {
        // Arrange
        val code = """
            if (x == 2) {
                // comment


                return true;
            }
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.CSHARP)

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
        val result = TreeSitterMetrics.parse(code, Language.CSHARP)

        // Assert
        assertThat(result.linesOfCode).isEqualTo(6.0)
    }

    @Test
    fun `should count method declaration for number of functions`() {
        // Arrange
        val code = """
            namespace ExampleSpace
            {
                abstract class MyClass
                {
                    public void someMethod() {/* Method statements here */ }
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.CSHARP)

        // Assert
        assertThat(result.numberOfFunctions).isEqualTo(1.0)
    }

    @Test
    fun `should count local function statement for number of functions`() {
        // Arrange
        val code = """
            public void someMethod() {/* Method statements here */ }
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.CSHARP)

        // Assert
        assertThat(result.numberOfFunctions).isEqualTo(1.0)
    }

    @Test
    fun `should count lambda expression for number of functions only when assigned to a variable`() {
        // Arrange
        val code = """
            Func<int, int> doubleValue = x => x * 2;

            var results = new[] { 1, 2, 3 }.Select(x => x * 2);
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.CSHARP)

        // Assert
        assertThat(result.numberOfFunctions).isEqualTo(1.0)
    }

    @Test
    fun `should count constructor for number of functions`() {
        // Arrange
        val code = """
            class Car {
                public string model;  // Create a field

                // Create a class constructor for the Car class
                public Car() {
                    model = "Mustang"; // Set the initial value for model
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.CSHARP)

        // Assert
        assertThat(result.numberOfFunctions).isEqualTo(1.0)
    }

    @Test
    fun `should correctly calculate all measures for parameters per function metric`() {
        // Arrange
        val code = """
            public void PrintSomething() {
                Console.WriteLine("Something");
            }

            public int AnotherFun(int a, int b) {
                return a + b;
            }

            public int Power(int x, int y) {
                return (int)Math.Pow(x, y);
            }

            public int OneParameter(int x) {
                return x * 2;
            }
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.CSHARP)

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
            public void NoComplexity() {
                Console.WriteLine("hello");
            }

            public int ComplexFun(int a, int b) {
                switch (a) {
                    case 1:
                        if (a * b > 10) {
                            break;
                        }
                        goto case 2;
                    case 2:
                        if ((a + b) % 2 == 0) {
                            Console.WriteLine("Sum is even");
                            break;
                        }
                        goto default;
                    default:
                        return a;
                }
                return b;
            }

            public bool IsEven(int x) {
                return (x % 2 == 0) ? true : false;
            }
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.CSHARP)

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
            public void MethodOne() {
            // comment at start of method
                Console.WriteLine("This is method one");
                // inline comment
                {}
            }

            public int MethodTwo(int x) {
                return x * 2;
            }
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.CSHARP)

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
        val result = TreeSitterMetrics.parse(code, Language.CSHARP)

        // Assert
        assertThat(result.messageChains).isEqualTo(1.0)
    }

    @Test
    fun `should count LOC correctly for code without trailing newline`() {
        // Arrange - 3 physical lines
        val code = """
            int a = 1;
            int b = 2;
            int c = 3;
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.CSHARP)

        // Assert - LOC equals RLOC for code without blanks or comments
        assertThat(result.linesOfCode).isEqualTo(3.0)
        assertThat(result.realLinesOfCode).isEqualTo(3.0)
    }
}
