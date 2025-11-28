package de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors

import de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes.AvailableFileMetrics
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.Test
import java.io.File

class ObjectiveCCollectorTest {
    private val collector = ObjectiveCCollector()

    private fun createTestFile(content: String): File {
        val tempFile = File.createTempFile("testFile", ".txt")
        tempFile.writeText(content)
        tempFile.deleteOnExit()
        return tempFile
    }

    @Test
    fun `should count if statement for complexity`() {
        // Arrange
        val fileContent = """
            if (x > 0) {
                NSLog(@"positive");
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes[AvailableFileMetrics.COMPLEXITY.metricName]).isEqualTo(1.0)
    }

    @Test
    fun `should count logical operators for complexity`() {
        // Arrange
        val fileContent = """
            if (x > 0 && (y > 10 || y == -1)) {
                NSLog(@"valid");
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes[AvailableFileMetrics.COMPLEXITY.metricName]).isEqualTo(3.0)
    }

    @Test
    fun `should count switch cases for complexity`() {
        // Arrange
        val fileContent = """
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
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes[AvailableFileMetrics.COMPLEXITY.metricName]).isEqualTo(3.0)
    }

    @Test
    fun `should count loops for complexity`() {
        // Arrange
        val fileContent = """
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
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes[AvailableFileMetrics.COMPLEXITY.metricName]).isEqualTo(3.0)
    }

    @Test
    fun `should count catch clause for complexity`() {
        // Arrange
        val fileContent = """
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
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes[AvailableFileMetrics.COMPLEXITY.metricName]).isEqualTo(1.0)
    }

    @Test
    fun `should count ternary operator for complexity`() {
        // Arrange
        val fileContent = """int result = x > 0 ? x : 0;"""
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes[AvailableFileMetrics.COMPLEXITY.metricName]).isEqualTo(1.0)
    }

    @Test
    fun `should count blocks for complexity`() {
        // Arrange
        val fileContent = """
            int (^addBlock)(int, int) = ^(int a, int b) {
                return a + b;
            };
        """.trimIndent()
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes[AvailableFileMetrics.COMPLEXITY.metricName]).isEqualTo(1.0)
    }

    @Test
    fun `should count Objective-C methods for number of functions`() {
        // Arrange
        val fileContent = """
            @implementation MyClass

            - (void)instanceMethod {
                NSLog(@"instance");
            }

            + (void)classMethod {
                NSLog(@"class");
            }

            @end
        """.trimIndent()
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes[AvailableFileMetrics.NUMBER_OF_FUNCTIONS.metricName]).isEqualTo(2.0)
    }

    @Test
    fun `should count C functions for complexity and number of functions`() {
        // Arrange
        val fileContent = """
            int cFunction(int x) {
                return x * 2;
            }

            void anotherFunction(void) {
                NSLog(@"hello");
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes[AvailableFileMetrics.NUMBER_OF_FUNCTIONS.metricName]).isEqualTo(2.0)
        Assertions.assertThat(result.attributes[AvailableFileMetrics.COMPLEXITY.metricName]).isEqualTo(2.0)
    }

    @Test
    fun `should not count message sends for complexity`() {
        // Arrange
        val fileContent = """
            [object method:arg1 with:arg2 and:arg3];
            [[array objectAtIndex:0] description];
        """.trimIndent()
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes[AvailableFileMetrics.COMPLEXITY.metricName]).isEqualTo(0.0)
    }

    @Test
    fun `should count line and multiline comments for comment_lines`() {
        // Arrange
        val fileContent = """
            // Single line comment

            /*
             * Multi-line comment
             * spanning multiple lines
             */
            // Another comment

            /// doc comment
        """.trimIndent()
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes[AvailableFileMetrics.COMMENT_LINES.metricName]).isEqualTo(7.0)
    }

    @Test
    fun `should not include comments or empty lines for rloc`() {
        // Arrange
        val fileContent = """
            - (BOOL)test {
                // comment


                return YES;
            }
        """.trimIndent() + "\n"
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes[AvailableFileMetrics.REAL_LINES_OF_CODE.metricName]).isEqualTo(3.0)
    }

    @Test
    fun `should count empty lines and comments for loc`() {
        // Arrange
        val fileContent = """
            - (BOOL)test {
                // comment


                return YES;
            }
        """.trimIndent() + "\n"
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes[AvailableFileMetrics.LINES_OF_CODE.metricName]).isEqualTo(6.0)
    }

    @Test
    fun `should correctly calculate all measures for parameters per function metric`() {
        // Arrange
        val fileContent = """
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
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes["max_parameters_per_function"]).isEqualTo(4.0)
        Assertions.assertThat(result.attributes["min_parameters_per_function"]).isEqualTo(0.0)
        Assertions.assertThat(result.attributes["mean_parameters_per_function"]).isEqualTo(1.75)
        Assertions.assertThat(result.attributes["median_parameters_per_function"]).isEqualTo(1.5)
    }

    @Test
    fun `should correctly calculate all measures for complexity per function metric`() {
        // Arrange
        val fileContent = """
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
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes["max_complexity_per_function"]).isEqualTo(3.0)
        Assertions.assertThat(result.attributes["min_complexity_per_function"]).isEqualTo(0.0)
        Assertions.assertThat(result.attributes["mean_complexity_per_function"]).isEqualTo(1.33)
        Assertions.assertThat(result.attributes["median_complexity_per_function"]).isEqualTo(1.0)
    }

    @Test
    fun `should correctly calculate rloc per function metric`() {
        // Arrange
        val fileContent = """
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
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes["max_rloc_per_function"]).isEqualTo(3.0)
        Assertions.assertThat(result.attributes["min_rloc_per_function"]).isEqualTo(1.0)
        Assertions.assertThat(result.attributes["mean_rloc_per_function"]).isEqualTo(2.0)
        Assertions.assertThat(result.attributes["median_rloc_per_function"]).isEqualTo(2.0)
    }

    @Test
    fun `should count mixed C and Objective-C code correctly`() {
        // Arrange
        val fileContent = """
            @implementation Calculator

            - (int)add:(int)a with:(int)b {
                return a + b;
            }

            @end

            int multiply(int x, int y) {
                return x * y;
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes[AvailableFileMetrics.NUMBER_OF_FUNCTIONS.metricName]).isEqualTo(2.0)
    }

    @Test
    fun `should handle category methods`() {
        // Arrange
        val fileContent = """
            @implementation Calculator (ExtendedOperations)

            - (int)multiply:(int)a with:(int)b {
                return a * b;
            }

            @end
        """.trimIndent()
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes[AvailableFileMetrics.NUMBER_OF_FUNCTIONS.metricName]).isEqualTo(1.0)
    }

    @Test
    fun `should handle blocks with control flow`() {
        // Arrange
        val fileContent = """
            int (^addBlock)(int, int) = ^int(int a, int b) {
                if (a > 0 && b > 0) {
                    return a + b;
                }
                return 0;
            };
        """.trimIndent()
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes[AvailableFileMetrics.COMPLEXITY.metricName]).isEqualTo(3.0)
    }

    @Test
    fun `should detect message chains with 4 or more method calls`() {
        // Arrange
        val fileContent = """obj.a().field.b().c().d();"""
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes[AvailableFileMetrics.MESSAGE_CHAINS.metricName]).isEqualTo(1.0)
    }

    @Test
    fun `should not detect message chains with fewer than 4 calls`() {
        // Arrange
        val fileContent = """obj.a().field.b();"""
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes[AvailableFileMetrics.MESSAGE_CHAINS.metricName]).isEqualTo(0.0)
    }
}
