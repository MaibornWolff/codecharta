package de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors

import de.maibornwolff.treesitter.excavationsite.api.AvailableFileMetrics
import de.maibornwolff.treesitter.excavationsite.api.Language
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.Test
import java.io.File

class CppCollectorTest {
    private val collector = TreeSitterLibraryCollector(Language.CPP)

    private fun createTestFile(content: String): File {
        val tempFile = File.createTempFile("testFile", ".txt")
        tempFile.writeText(content)
        tempFile.deleteOnExit()
        return tempFile
    }

    @Test
    fun `should count lambda expressions for complexity`() {
        // given
        val fileContent = """[](int x){ return x * 2; }"""
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableFileMetrics.COMPLEXITY.metricName]).isEqualTo(1.0)
    }

    @Test
    fun `should count for range statement for complexity`() {
        // given
        val fileContent = """
            for( int y : x ) {
                cout << y << " ";
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableFileMetrics.COMPLEXITY.metricName]).isEqualTo(1.0)
    }

    @Test
    fun `should count conditional expression for complexity`() {
        // given
        val fileContent = """int x = (y > 0) ? 1 : -1;"""
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableFileMetrics.COMPLEXITY.metricName]).isEqualTo(1.0)
    }

    @Test
    fun `should count binary expressions with && operator for complexity`() {
        // given
        val fileContent = """
            if (x > 0 && y < 10) {
                return true;
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableFileMetrics.COMPLEXITY.metricName]).isEqualTo(2.0)
    }

    @Test
    fun `should count binary expressions with 'and' and 'or' operator for complexity`() {
        // given
        val fileContent = """
            if (x > 0 and y < 10 or z == 5) {
                return true;
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableFileMetrics.COMPLEXITY.metricName]).isEqualTo(3.0)
    }

    @Test
    fun `should count binary expressions with xor operator for complexity`() {
        // given
        val fileContent = """
            if (x > 0 xor y < 10) {
                return true;
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableFileMetrics.COMPLEXITY.metricName]).isEqualTo(2.0)
    }

    @Test
    fun `should count switch case for complexity`() {
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
    fun `should count seh-except clause for complexity`() {
        // given
        val fileContent = """
            __try
            {
                TestExceptions();
            }
            __except(EXCEPTION_EXECUTE_HANDLER)
            {
                printf("Executing SEH __except block\n");
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableFileMetrics.COMPLEXITY.metricName]).isEqualTo(1.0)
    }

    @Test
    fun `should count line and block comments for comment_lines`() {
        // given
        val fileContent = """
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
    fun `should count function definition but not declaration for number of functions`() {
        // given
        val fileContent = """
            void testDeclaration()

            void myFunction() {
                printf("I just got executed!");
            }
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
            auto doubleValue = [](int x) { return x * 2; };

            std::for_each(numbers.begin(), numbers.end(), [](int x) {
                std::cout << x * 2 << " ";
            });
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
