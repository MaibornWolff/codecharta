package de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors

import de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes.AvailableFileMetrics
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.treesitter.TSParser
import org.treesitter.TreeSitterCSharp
import java.io.File

class CSharpCollectorTest {
    private var parser = TSParser()
    private val collector = CSharpCollector()

    @BeforeEach
    fun setUp() {
        parser.setLanguage(TreeSitterCSharp())
    }

    private fun createTestFile(content: String): File {
        val tempFile = File.createTempFile("testFile", ".txt")
        tempFile.writeText(content)
        tempFile.deleteOnExit()
        return tempFile
    }

    @Test
    fun `should count lambda expressions for complexity`() {
        // given
        val fileContent = """num => num * 5;"""
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableFileMetrics.COMPLEXITY.metricName]).isEqualTo(1.0)
    }

    @Test
    fun `should count conditional expression for complexity`() {
        // given
        val fileContent = """x = (y>0) ? 1 : -1;"""
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableFileMetrics.COMPLEXITY.metricName]).isEqualTo(1.0)
    }

    @Test
    fun `should count 'and' and 'or' patterns for complexity`() {
        // given
        val fileContent = """if (obj is string and not null) { }"""
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableFileMetrics.COMPLEXITY.metricName]).isEqualTo(2.0)
    }

    @Test
    fun `should count binary expressions with && operator for complexity`() {
        // given
        val fileContent = """if (x > 0 && y < 10) { }"""
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableFileMetrics.COMPLEXITY.metricName]).isEqualTo(2.0)
    }

    @Test
    fun `should count null coalescing operator for complexity`() {
        // given
        val fileContent = """string result = name ?? "default";"""
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableFileMetrics.COMPLEXITY.metricName]).isEqualTo(1.0)
    }

    @Test
    fun `should count switch cases for complexity`() {
        // given
        val fileContent = """
            switch (value) {
                case 1:
                    break;
                case 2:
                    break;
                default:
                    break;
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableFileMetrics.COMPLEXITY.metricName]).isEqualTo(3.0)
    }

    @Test
    fun `should count switch expression arms for complexity`() {
        // given
        val fileContent = """
            string result = value switch {
                1 => "one",
                2 => "two",
                _ => "other"
            };
        """.trimIndent()
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableFileMetrics.COMPLEXITY.metricName]).isEqualTo(3.0)
    }

    @Test
    fun `should count accessor declarations for complexity`() {
        // given
        val fileContent = """
            public class Example {
                public string Name {
                    get => name;
                    set => name = value;
                }
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableFileMetrics.COMPLEXITY.metricName]).isEqualTo(2.0)
    }

    @Test
    fun `should count line and block comments for comment_lines`() {
        // given
        val fileContent = """
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
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableFileMetrics.COMMENT_LINES.metricName]).isEqualTo(7.0)
    }

    @Test
    fun `should not include comments or empty lines for rloc`() {
        // given
        val fileContent = """
            if (x == 2) {
                // comment


                return true;
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableFileMetrics.REAL_LINES_OF_CODE.metricName]).isEqualTo(3.0)
    }

    @Test
    fun `should count empty lines and comments for loc`() {
        // given
        val fileContent = """
            if (x == 2) {
                // comment


                return true;
            }
        """.trimIndent() + "\n" // this newline simulates end of file
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableFileMetrics.LINES_OF_CODE.metricName]).isEqualTo(6.0)
    }

    @Test
    fun `should count method declaration for number of functions`() {
        // given
        val fileContent = """
            namespace ExampleSpace
            {
                abstract class MyClass
                {
                    public void someMethod() {/* Method statements here */ }
                }
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableFileMetrics.NUMBER_OF_FUNCTIONS.metricName]).isEqualTo(1.0)
    }

    @Test
    fun `should count local function statement for number of functions`() {
        // given
        val fileContent = """
            public void someMethod() {/* Method statements here */ }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableFileMetrics.NUMBER_OF_FUNCTIONS.metricName]).isEqualTo(1.0)
    }

    @Test
    fun `should count lambda expression for number of functions only when assigned to a variable`() {
        // given
        val fileContent = """
            Func<int, int> doubleValue = x => x * 2;

            var results = new[] { 1, 2, 3 }.Select(x => x * 2);
        """.trimIndent()
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableFileMetrics.NUMBER_OF_FUNCTIONS.metricName]).isEqualTo(1.0)
    }

    @Test
    fun `should count constructor for number of functions`() {
        // given
        val fileContent = """
            class Car {
                public string model;  // Create a field

                // Create a class constructor for the Car class
                public Car() {
                    model = "Mustang"; // Set the initial value for model
                }
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableFileMetrics.NUMBER_OF_FUNCTIONS.metricName]).isEqualTo(1.0)
    }

    @Test
    fun `should correctly calculate all measures for parameters per function metric`() {
        // given
        val fileContent = """
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
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes["max_parameters_per_function"]).isEqualTo(2.0)
        Assertions.assertThat(result.attributes["min_parameters_per_function"]).isEqualTo(0.0)
        Assertions.assertThat(result.attributes["mean_parameters_per_function"]).isEqualTo(1.25)
        Assertions.assertThat(result.attributes["median_parameters_per_function"]).isEqualTo(1.5)
    }

    @Test
    fun `should correctly calculate all measures for complexity per function metric`() {
        // given
        val fileContent = """
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
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes["max_complexity_per_function"]).isEqualTo(5.0)
        Assertions.assertThat(result.attributes["min_complexity_per_function"]).isEqualTo(0.0)
        Assertions.assertThat(result.attributes["mean_complexity_per_function"]).isEqualTo(2.0)
        Assertions.assertThat(result.attributes["median_complexity_per_function"]).isEqualTo(1.0)
    }

    @Test
    fun `should correctly calculate rloc per function metric`() {
        // given
        val fileContent = """
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
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes["max_rloc_per_function"]).isEqualTo(2.0)
        Assertions.assertThat(result.attributes["min_rloc_per_function"]).isEqualTo(1.0)
        Assertions.assertThat(result.attributes["mean_rloc_per_function"]).isEqualTo(1.5)
        Assertions.assertThat(result.attributes["median_rloc_per_function"]).isEqualTo(1.5)
    }

    @Test
    fun `should detect message chains with 4 or more method calls`() {
        // given
        val fileContent = """obj.a().field.b().c().d();"""
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableFileMetrics.MESSAGE_CHAINS.metricName]).isEqualTo(1.0)
    }
}
