package de.maibornwolff.treesitter.excavationsite.languages.objectivec

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterMetrics
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class ObjectiveCMetricsTest {
    @Test
    fun `should count if statement for complexity`() {
        // Arrange
        val code = """
            if (x > 0) {
                NSLog(@"positive");
            }
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.complexity).isEqualTo(1.0)
    }

    @Test
    fun `should count logical operators for complexity`() {
        // Arrange
        val code = """
            if (x > 0 && (y > 10 || y == -1)) {
                NSLog(@"valid");
            }
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.complexity).isEqualTo(3.0)
    }

    @Test
    fun `should count switch cases for complexity`() {
        // Arrange
        val code = """
            switch (value) {
                case 0:
                    NSLog(@"zero");
                    break;
                case 1:
                    NSLog(@"one");
                    break;
                default:
                    NSLog(@"other");
            }
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.complexity).isEqualTo(3.0)
    }

    @Test
    fun `should count loops for complexity`() {
        // Arrange
        val code = """
            for (int i = 0; i < 10; i++) {
                NSLog(@"%d", i);
            }

            while (condition) {
                doSomething();
            }

            do {
                doSomething();
            } while (condition);
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.complexity).isEqualTo(3.0)
    }

    @Test
    fun `should count catch clause for complexity`() {
        // Arrange
        val code = """
            @try {
                [self somethingThatThrows];
            }
            @catch (NSException *exception) {
                NSLog(@"error");
            }
            @finally {
                NSLog(@"cleanup");
            }
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.complexity).isEqualTo(1.0)
    }

    @Test
    fun `should count ternary operator for complexity`() {
        // Arrange
        val code = """int result = x > 0 ? x : 0;"""

        // Act
        val result = TreeSitterMetrics.parse(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.complexity).isEqualTo(1.0)
    }

    @Test
    fun `should count blocks for complexity`() {
        // Arrange
        val code = """
            int (^addBlock)(int, int) = ^(int a, int b) {
                return a + b;
            };
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.complexity).isEqualTo(1.0)
    }

    @Test
    fun `should count Objective-C methods for number of functions`() {
        // Arrange
        val code = """
            @implementation MyClass

            - (void)instanceMethod {
                NSLog(@"instance");
            }

            + (void)classMethod {
                NSLog(@"class");
            }

            @end
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.numberOfFunctions).isEqualTo(2.0)
    }

    @Test
    fun `should count C functions for complexity and number of functions`() {
        // Arrange
        val code = """
            int cFunction(int x) {
                return x * 2;
            }

            void anotherFunction(void) {
                NSLog(@"hello");
            }
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.numberOfFunctions).isEqualTo(2.0)
        assertThat(result.complexity).isEqualTo(2.0)
    }

    @Test
    fun `should not count message sends for complexity`() {
        // Arrange
        val code = """
            [object method:arg1 with:arg2 and:arg3];
            [[array objectAtIndex:0] description];
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.complexity).isEqualTo(0.0)
    }

    @Test
    fun `should count line and multiline comments for comment_lines`() {
        // Arrange
        val code = """
            // Single line comment

            /*
             * Multi-line comment
             * spanning multiple lines
             */
            // Another comment

            /// doc comment
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.commentLines).isEqualTo(7.0)
    }

    @Test
    fun `should not include comments or empty lines for rloc`() {
        // Arrange
        val code = """
            - (BOOL)test {
                // comment


                return YES;
            }
        """.trimIndent() + "\n"

        // Act
        val result = TreeSitterMetrics.parse(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.realLinesOfCode).isEqualTo(3.0)
    }

    @Test
    fun `should count empty lines and comments for loc`() {
        // Arrange
        val code = """
            - (BOOL)test {
                // comment


                return YES;
            }
        """.trimIndent() + "\n"

        // Act
        val result = TreeSitterMetrics.parse(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.linesOfCode).isEqualTo(6.0)
    }

    @Test
    fun `should correctly calculate all measures for parameters per function metric`() {
        // Arrange
        val code = """
            @implementation MyClass

            - (void)noParams {
                NSLog(@"hello");
            }

            - (void)oneParam:(int)x {
                NSLog(@"%d", x);
            }

            - (int)twoParams:(int)a with:(int)b {
                return a + b;
            }

            @end

            int fourParams(int a, int b, int c, int d) {
                return a + b + c + d;
            }
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.perFunctionMetrics["max_parameters_per_function"]).isEqualTo(4.0)
        assertThat(result.perFunctionMetrics["min_parameters_per_function"]).isEqualTo(0.0)
        assertThat(result.perFunctionMetrics["mean_parameters_per_function"]).isEqualTo(1.75)
        assertThat(result.perFunctionMetrics["median_parameters_per_function"]).isEqualTo(1.5)
    }

    @Test
    fun `should correctly calculate all measures for complexity per function metric`() {
        // Arrange
        val code = """
            @implementation MyClass

            - (void)noComplexity {
                NSLog(@"hello");
            }

            - (void)simpleIf {
                if (condition) {
                    doSomething();
                }
            }

            - (void)complexFunction:(int)x {
                if (x > 0 && x < 10) {
                    for (int i = 0; i < x; i++) {
                        NSLog(@"%d", i);
                    }
                } else {
                    NSLog(@"invalid");
                }
            }

            @end
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.OBJECTIVE_C)

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
            @implementation MyClass

            - (void)shortFunction {
                NSLog(@"short");
            }

            - (void)longerFunction {
                // comment
                int x = 1;
                int y = 2;
                NSLog(@"%d", x + y);
            }

            @end
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.perFunctionMetrics["max_rloc_per_function"]).isEqualTo(3.0)
        assertThat(result.perFunctionMetrics["min_rloc_per_function"]).isEqualTo(1.0)
        assertThat(result.perFunctionMetrics["mean_rloc_per_function"]).isEqualTo(2.0)
        assertThat(result.perFunctionMetrics["median_rloc_per_function"]).isEqualTo(2.0)
    }

    @Test
    fun `should count mixed C and Objective-C code correctly`() {
        // Arrange
        val code = """
            @implementation Calculator

            - (int)add:(int)a with:(int)b {
                return a + b;
            }

            @end

            int multiply(int x, int y) {
                return x * y;
            }
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.numberOfFunctions).isEqualTo(2.0)
    }

    @Test
    fun `should handle category methods`() {
        // Arrange
        val code = """
            @implementation Calculator (ExtendedOperations)

            - (int)multiply:(int)a with:(int)b {
                return a * b;
            }

            @end
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.numberOfFunctions).isEqualTo(1.0)
    }

    @Test
    fun `should handle blocks with control flow`() {
        // Arrange
        val code = """
            int (^addBlock)(int, int) = ^int(int a, int b) {
                if (a > 0 && b > 0) {
                    return a + b;
                }
                return 0;
            };
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.complexity).isEqualTo(3.0)
    }

    @Test
    fun `should detect message chains with 4 or more method calls`() {
        // Arrange
        val code = """obj.a().field.b().c().d();"""

        // Act
        val result = TreeSitterMetrics.parse(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.messageChains).isEqualTo(1.0)
    }

    @Test
    fun `should not detect message chains with fewer than 4 calls`() {
        // Arrange
        val code = """obj.a().field.b();"""

        // Act
        val result = TreeSitterMetrics.parse(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.messageChains).isEqualTo(0.0)
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
        val result = TreeSitterMetrics.parse(code, Language.OBJECTIVE_C)

        // Assert - LOC equals RLOC for code without blanks or comments
        assertThat(result.linesOfCode).isEqualTo(3.0)
        assertThat(result.realLinesOfCode).isEqualTo(3.0)
    }
}
