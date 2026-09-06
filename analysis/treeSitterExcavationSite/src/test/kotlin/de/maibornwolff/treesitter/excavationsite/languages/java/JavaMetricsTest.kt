package de.maibornwolff.treesitter.excavationsite.languages.java

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterMetrics
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class JavaMetricsTest {
    @Test
    fun `should count lambda expressions for complexity`() {
        // Arrange
        val code = """int sum = (int x, int y) -> x + y;"""

        // Act
        val result = TreeSitterMetrics.parse(code, Language.JAVA)

        // Assert
        assertThat(result.complexity).isEqualTo(1.0)
    }

    @Test
    fun `should count ternary operator for complexity`() {
        // Arrange
        val code = """x = (y>0) ? 1 : -1;"""

        // Act
        val result = TreeSitterMetrics.parse(code, Language.JAVA)

        // Assert
        assertThat(result.logicComplexity).isEqualTo(1.0)
    }

    @Test
    fun `should count enhanced for loop for complexity`() {
        // Arrange
        val code = """
            for (char item: vowels) {
                System.out.println(item);
            }
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.JAVA)

        // Assert
        assertThat(result.logicComplexity).isEqualTo(1.0)
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
            public void helloWorld() {
                // line comment
                System.out.println("Hello"); /* comment in code */ System.out.println("world");
            }
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.JAVA)

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
        val result = TreeSitterMetrics.parse(code, Language.JAVA)

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
        val result = TreeSitterMetrics.parse(code, Language.JAVA)

        // Assert
        assertThat(result.linesOfCode).isEqualTo(6.0)
    }

    @Test
    fun `should count normal function declaration for number of functions`() {
        // Arrange
        val code = """
            public void testFun() {
                System.out.println("normal method declaration");
            }
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.JAVA)

        // Assert
        assertThat(result.numberOfFunctions).isEqualTo(1.0)
    }

    @Test
    fun `should count lambda functions for number of functions only when they are assigned to a variable`() {
        // Arrange
        val code = """
            // Lambda assigned to a variable (should be counted)
            java.util.function.Consumer<String> tester = (content) -> {
                System.out.println("Logging" + content);
            };

            // Inline lambda in method call (should not be counted)
            java.util.List<String> x = java.util.Arrays.asList("a", "b", "c");
            x.forEach((it) -> { System.out.println(it); });
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.JAVA)

        // Assert
        assertThat(result.numberOfFunctions).isEqualTo(1.0)
    }

    @Test
    fun `should count constructor and compact constructor for number of functions`() {
        // Arrange
        val code = """
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

        // Act
        val result = TreeSitterMetrics.parse(code, Language.JAVA)

        // Assert
        assertThat(result.numberOfFunctions).isEqualTo(2.0)
    }

    @Test
    fun `should correctly calculate all measures for parameters per function metric`() {
        // Arrange
        val code = """
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

        // Act
        val result = TreeSitterMetrics.parse(code, Language.JAVA)

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
            public void noComplexity() {
                System.out.println("hello");
            }

            public int complexFun(int a, int b) {
                switch (a) {
                    case 1:
                        if (a * b > 10) {
                            break;
                        }
                    case 2:
                        if ((a + b) % 2 == 0) {
                            System.out.println("Sum is even");
                            break;
                        }
                    default:
                        return a;
                }
                return b;
            }

            public boolean isEven(int x) {
                return (x % 2 == 0) ? true : false;
            }
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.JAVA)

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
            public void methodOne() {
            // comment at start of method
                System.out.println("This is method one");
                // inline comment
                {}
            }

            public int methodTwo(int x) {
                return x * 2;
            }
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.JAVA)

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
        val result = TreeSitterMetrics.parse(code, Language.JAVA)

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
        val result = TreeSitterMetrics.parse(code, Language.JAVA)

        // Assert - LOC equals RLOC for code without blanks or comments
        assertThat(result.linesOfCode).isEqualTo(3.0)
        assertThat(result.realLinesOfCode).isEqualTo(3.0)
    }
}
