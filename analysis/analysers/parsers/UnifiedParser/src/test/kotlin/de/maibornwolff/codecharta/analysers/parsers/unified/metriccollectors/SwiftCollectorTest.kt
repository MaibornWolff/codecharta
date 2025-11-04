package de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors

import de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes.AvailableFileMetrics
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.treesitter.TSParser
import org.treesitter.TreeSitterSwift
import java.io.File

class SwiftCollectorTest {
    private var parser = TSParser()
    private val collector = SwiftCollector()

    @BeforeEach
    fun setUp() {
        parser.setLanguage(TreeSitterSwift())
    }

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
            if x > 0 {
                print("positive")
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes[AvailableFileMetrics.COMPLEXITY.metricName]).isEqualTo(1.0)
    }

    @Test
    fun `should count guard statement for complexity`() {
        // Arrange
        val fileContent = """
            guard let unwrapped = value else {
                return
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
            if x > 0 && (y > 10 || y == -1) {
                print("valid")
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes[AvailableFileMetrics.COMPLEXITY.metricName]).isEqualTo(3.0)
    }

    @Test
    fun `should count nil-coalescing operator for complexity`() {
        // Arrange
        val fileContent = """let result = optionalValue ?? defaultValue"""
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes[AvailableFileMetrics.COMPLEXITY.metricName]).isEqualTo(1.0)
    }

    @Test
    fun `should count switch cases for complexity`() {
        // Arrange
        val fileContent = """
            switch value {
            case 0:
                print("zero")
            case 1:
                print("one")
            default:
                print("other")
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
            for i in 0..<10 {
                print(i)
            }

            while condition {
                doSomething()
            }

            repeat {
                doSomething()
            } while condition
        """.trimIndent()
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes[AvailableFileMetrics.COMPLEXITY.metricName]).isEqualTo(3.0)
    }

    @Test
    fun `should count catch blocks for complexity`() {
        // Arrange
        val fileContent = """
            do {
                try somethingThatThrows()
            } catch {
                print("error")
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes[AvailableFileMetrics.COMPLEXITY.metricName]).isEqualTo(1.0)
    }

    @Test
    fun `should count defer statement for complexity`() {
        // Arrange
        val fileContent = """
            defer {
                cleanup()
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
        val fileContent = """let result = condition ? trueValue : falseValue"""
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes[AvailableFileMetrics.COMPLEXITY.metricName]).isEqualTo(1.0)
    }

    @Test
    fun `should not count optional chaining for complexity`() {
        // Arrange
        val fileContent = """let result = object?.property?.method()"""
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes[AvailableFileMetrics.COMPLEXITY.metricName]).isEqualTo(0.0)
    }

    @Test
    fun `should count closures for complexity and functions`() {
        // Arrange
        val fileContent = """
            let closure = { (x: Int, y: Int) -> Int in
                return x + y
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes[AvailableFileMetrics.COMPLEXITY.metricName]).isEqualTo(1.0)
        Assertions.assertThat(result.attributes[AvailableFileMetrics.NUMBER_OF_FUNCTIONS.metricName]).isEqualTo(0.0)
    }

    @Test
    fun `should count functions and methods for number of functions`() {
        // Arrange
        val fileContent = """
            func topLevelFunction() {
                print("hello")
            }

            class MyClass {
                func method() {
                    print("method")
                }

                init() {
                    print("init")
                }

                deinit {
                    print("deinit")
                }
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes[AvailableFileMetrics.NUMBER_OF_FUNCTIONS.metricName]).isEqualTo(4.0)
    }

    @Test
    fun `should count subscript declarations for complexity`() {
        // Arrange
        val fileContent = """
            struct Matrix {
                subscript(row: Int, col: Int) -> Int {
                    return 0
                }
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes[AvailableFileMetrics.COMPLEXITY.metricName]).isEqualTo(1.0)
        Assertions.assertThat(result.attributes[AvailableFileMetrics.NUMBER_OF_FUNCTIONS.metricName]).isEqualTo(0.0)
    }

    @Test
    fun `should count computed properties with getter and setter for number of functions`() {
        // Arrange
        val fileContent = """
            struct Temperature {
                var celsius: Double
                var fahrenheit: Double {
                    get {
                        return celsius * 9 / 5 + 32
                    }
                    set {
                        celsius = (newValue - 32) * 5 / 9
                    }
                }
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes[AvailableFileMetrics.NUMBER_OF_FUNCTIONS.metricName]).isEqualTo(2.0)
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
        """.trimIndent()
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes[AvailableFileMetrics.COMMENT_LINES.metricName]).isEqualTo(6.0)
    }

    @Test
    fun `should not include comments or empty lines for rloc`() {
        // Arrange
        val fileContent = """
            func test() {
                // comment


                return true
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
            func test() {
                // comment


                return true
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
            func noParams() {
                print("hello")
            }

            func oneParam(_ x: Int) {
                print(x)
            }

            func twoParams(_ a: Int, _ b: Int) -> Int {
                return a + b
            }

            func fourParams(_ a: Int, _ b: Int, _ c: Int, _ d: Int) -> Int {
                return a + b + c + d
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
            func noComplexity() {
                print("hello")
            }

            func simpleIf() {
                if condition {
                    doSomething()
                }
            }

            func complexFunction(_ x: Int) {
                if x > 0 && x < 10 {
                    for i in 0..<x {
                        print(i)
                    }
                } else {
                    print("invalid")
                }
            }
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
            func shortFunction() {
                print("short")
            }

            func longerFunction() {
                // comment
                let x = 1
                let y = 2
                print(x + y)
            }
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
}
