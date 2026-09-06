package de.maibornwolff.treesitter.excavationsite.languages.cpp

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterMetrics
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class CppMetricsTest {
    @Test
    fun `should count lambda expressions for complexity`() {
        // Arrange
        val code = """[](int x){ return x * 2; }"""

        // Act
        val result = TreeSitterMetrics.parse(code, Language.CPP)

        // Assert
        assertThat(result.complexity).isEqualTo(1.0)
    }

    @Test
    fun `should count for range statement for complexity`() {
        // Arrange
        val code = """
            for( int y : x ) {
                cout << y << " ";
            }
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.CPP)

        // Assert
        assertThat(result.complexity).isEqualTo(1.0)
    }

    @Test
    fun `should count conditional expression for complexity`() {
        // Arrange
        val code = """int x = (y > 0) ? 1 : -1;"""

        // Act
        val result = TreeSitterMetrics.parse(code, Language.CPP)

        // Assert
        assertThat(result.complexity).isEqualTo(1.0)
    }

    @Test
    fun `should count binary expressions with && operator for complexity`() {
        // Arrange
        val code = """
            if (x > 0 && y < 10) {
                return true;
            }
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.CPP)

        // Assert
        assertThat(result.complexity).isEqualTo(2.0)
    }

    @Test
    fun `should count binary expressions with 'and' and 'or' operator for complexity`() {
        // Arrange
        val code = """
            if (x > 0 and y < 10 or z == 5) {
                return true;
            }
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.CPP)

        // Assert
        assertThat(result.complexity).isEqualTo(3.0)
    }

    @Test
    fun `should count binary expressions with xor operator for complexity`() {
        // Arrange
        val code = """
            if (x > 0 xor y < 10) {
                return true;
            }
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.CPP)

        // Assert
        assertThat(result.complexity).isEqualTo(2.0)
    }

    @Test
    fun `should count switch case for complexity`() {
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
        val result = TreeSitterMetrics.parse(code, Language.CPP)

        // Assert
        assertThat(result.complexity).isEqualTo(3.0)
    }

    @Test
    fun `should count seh-except clause for complexity`() {
        // Arrange
        val code = """
            __try
            {
                TestExceptions();
            }
            __except(EXCEPTION_EXECUTE_HANDLER)
            {
                printf("Executing SEH __except block\n");
            }
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.CPP)

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
             void helloWorld() {
                 // line comment
                 std::cout << "Hello"; /* comment in code */ std::cout << "world";
             }
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.CPP)

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
        val result = TreeSitterMetrics.parse(code, Language.CPP)

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
        val result = TreeSitterMetrics.parse(code, Language.CPP)

        // Assert
        assertThat(result.linesOfCode).isEqualTo(6.0)
    }

    @Test
    fun `should count function definition but not declaration for number of functions`() {
        // Arrange
        val code = """
            void testDeclaration()

            void myFunction() {
                printf("I just got executed!");
            }
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.CPP)

        // Assert
        assertThat(result.numberOfFunctions).isEqualTo(1.0)
    }

    @Test
    fun `should count lambda expression for number of functions only when assigned to a variable`() {
        // Arrange
        val code = """
            auto doubleValue = [](int x) { return x * 2; };

            std::for_each(numbers.begin(), numbers.end(), [](int x) {
                std::cout << x * 2 << " ";
            });
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.CPP)

        // Assert
        assertThat(result.numberOfFunctions).isEqualTo(1.0)
    }

    @Test
    fun `should correctly calculate all measures for parameters per function metric`() {
        // Arrange
        val code = """
            void printSomething() {
                std::cout << "Something" << std::endl;
            }

            int anotherFun(int a, int b) {
                return a + b;
            }

            int power(int x, int y) {
                return std::pow(x, y);
            }

            int oneParameter(int x) {
                return x * 2;
            }
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.CPP)

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
            void noComplexity() {
                std::cout << "hello" << std::endl;
            }

            int complexFun(int a, int b) {
                switch (a) {
                    case 1:
                        if (a * b > 10) {
                            break;
                        }
                    case 2:
                        if ((a + b) % 2 == 0) {
                            std::cout << "Sum is even" << std::endl;
                            break;
                        }
                    default:
                        return a;
                }
                return b;
            }

            bool isEven(int x) {
                return (x % 2 == 0) ? true : false;
            }
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.CPP)

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
            void functionOne() {
            // comment at start of function
                std::cout << "This is function one" << std::endl;
                // inline comment
                {}
            }

            int functionTwo(int x) {
                return x * 2;
            }
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.CPP)

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
        val result = TreeSitterMetrics.parse(code, Language.CPP)

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
        val result = TreeSitterMetrics.parse(code, Language.CPP)

        // Assert - LOC equals RLOC for code without blanks or comments
        assertThat(result.linesOfCode).isEqualTo(3.0)
        assertThat(result.realLinesOfCode).isEqualTo(3.0)
    }
}
