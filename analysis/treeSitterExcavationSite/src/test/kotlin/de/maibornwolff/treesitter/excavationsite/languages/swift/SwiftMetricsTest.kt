package de.maibornwolff.treesitter.excavationsite.languages.swift

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterMetrics
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class SwiftMetricsTest {
    @Test
    fun `should count if statement for complexity`() {
        // Arrange
        val code = """
            if x > 0 {
                print("positive")
            }
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.SWIFT)

        // Assert
        assertThat(result.complexity).isEqualTo(1.0)
    }

    @Test
    fun `should count guard statement for complexity`() {
        // Arrange
        val code = """
            guard let unwrapped = value else {
                return
            }
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.SWIFT)

        // Assert
        assertThat(result.complexity).isEqualTo(1.0)
    }

    @Test
    fun `should count logical operators for complexity`() {
        // Arrange
        val code = """
            if x > 0 && (y > 10 || y == -1) {
                print("valid")
            }
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.SWIFT)

        // Assert
        assertThat(result.complexity).isEqualTo(3.0)
    }

    @Test
    fun `should count nil-coalescing operator for complexity`() {
        // Arrange
        val code = """let result = optionalValue ?? defaultValue"""

        // Act
        val result = TreeSitterMetrics.parse(code, Language.SWIFT)

        // Assert
        assertThat(result.complexity).isEqualTo(1.0)
    }

    @Test
    fun `should count switch cases for complexity`() {
        // Arrange
        val code = """
            switch value {
            case 0:
                print("zero")
            case 1:
                print("one")
            default:
                print("other")
            }
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.SWIFT)

        // Assert
        assertThat(result.complexity).isEqualTo(3.0)
    }

    @Test
    fun `should count loops for complexity`() {
        // Arrange
        val code = """
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

        // Act
        val result = TreeSitterMetrics.parse(code, Language.SWIFT)

        // Assert
        assertThat(result.complexity).isEqualTo(3.0)
    }

    @Test
    fun `should count catch blocks for complexity`() {
        // Arrange
        val code = """
            do {
                try somethingThatThrows()
            } catch {
                print("error")
            }
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.SWIFT)

        // Assert
        assertThat(result.complexity).isEqualTo(1.0)
    }

    @Test
    fun `should count defer statement for complexity`() {
        // Arrange
        val code = """
            defer {
                cleanup()
            }
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.SWIFT)

        // Assert
        assertThat(result.complexity).isEqualTo(1.0)
    }

    @Test
    fun `should count ternary operator for complexity`() {
        // Arrange
        val code = """let result = condition ? trueValue : falseValue"""

        // Act
        val result = TreeSitterMetrics.parse(code, Language.SWIFT)

        // Assert
        assertThat(result.complexity).isEqualTo(1.0)
    }

    @Test
    fun `should count willSet and didSet property observers for complexity`() {
        // Arrange
        val code = """
            var value: Int = 0 {
                willSet {
                    print("About to set value")
                }
                didSet {
                    print("Value was set")
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.SWIFT)

        // Assert
        assertThat(result.complexity).isEqualTo(2.0)
    }

    @Test
    fun `should not count optional chaining for complexity`() {
        // Arrange
        val code = """let result = object?.property?.method()"""

        // Act
        val result = TreeSitterMetrics.parse(code, Language.SWIFT)

        // Assert
        assertThat(result.complexity).isEqualTo(0.0)
    }

    @Test
    fun `should count closures for complexity and functions`() {
        // Arrange
        val code = """
            let closure = { (x: Int, y: Int) -> Int in
                return x + y
            }
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.SWIFT)

        // Assert
        assertThat(result.complexity).isEqualTo(1.0)
        assertThat(result.numberOfFunctions).isEqualTo(0.0)
    }

    @Test
    fun `should count functions and methods for number of functions`() {
        // Arrange
        val code = """
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

        // Act
        val result = TreeSitterMetrics.parse(code, Language.SWIFT)

        // Assert
        assertThat(result.numberOfFunctions).isEqualTo(4.0)
    }

    @Test
    fun `should count subscript declarations for complexity`() {
        // Arrange
        val code = """
            struct Matrix {
                subscript(row: Int, col: Int) -> Int {
                    return 0
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.SWIFT)

        // Assert
        assertThat(result.complexity).isEqualTo(1.0)
        assertThat(result.numberOfFunctions).isEqualTo(0.0)
    }

    @Test
    fun `should count computed properties with getter and setter for number of functions`() {
        // Arrange
        val code = """
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

        // Act
        val result = TreeSitterMetrics.parse(code, Language.SWIFT)

        // Assert
        assertThat(result.numberOfFunctions).isEqualTo(2.0)
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
        val result = TreeSitterMetrics.parse(code, Language.SWIFT)

        // Assert
        assertThat(result.commentLines).isEqualTo(7.0)
    }

    @Test
    fun `should not include comments or empty lines for rloc`() {
        // Arrange
        val code = """
            func test() {
                // comment


                return true
            }
        """.trimIndent() + "\n"

        // Act
        val result = TreeSitterMetrics.parse(code, Language.SWIFT)

        // Assert
        assertThat(result.realLinesOfCode).isEqualTo(3.0)
    }

    @Test
    fun `should count empty lines and comments for loc`() {
        // Arrange
        val code = """
            func test() {
                // comment


                return true
            }
        """.trimIndent() + "\n"

        // Act
        val result = TreeSitterMetrics.parse(code, Language.SWIFT)

        // Assert
        assertThat(result.linesOfCode).isEqualTo(6.0)
    }

    @Test
    fun `should correctly calculate all measures for parameters per function metric`() {
        // Arrange
        val code = """
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

        // Act
        val result = TreeSitterMetrics.parse(code, Language.SWIFT)

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

        // Act
        val result = TreeSitterMetrics.parse(code, Language.SWIFT)

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

        // Act
        val result = TreeSitterMetrics.parse(code, Language.SWIFT)

        // Assert
        assertThat(result.perFunctionMetrics["max_rloc_per_function"]).isEqualTo(3.0)
        assertThat(result.perFunctionMetrics["min_rloc_per_function"]).isEqualTo(1.0)
        assertThat(result.perFunctionMetrics["mean_rloc_per_function"]).isEqualTo(2.0)
        assertThat(result.perFunctionMetrics["median_rloc_per_function"]).isEqualTo(2.0)
    }

    @Test
    fun `should detect message chains with 4 or more method calls`() {
        // Arrange
        val code = """obj.a().field.b().c().d()"""

        // Act
        val result = TreeSitterMetrics.parse(code, Language.SWIFT)

        // Assert
        assertThat(result.messageChains).isEqualTo(1.0)
    }

    @Test
    fun `should count LOC correctly for code without trailing newline`() {
        // Arrange - 3 physical lines
        val code = """
            let a = 1
            let b = 2
            let c = 3
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.SWIFT)

        // Assert - LOC equals RLOC for code without blanks or comments
        assertThat(result.linesOfCode).isEqualTo(3.0)
        assertThat(result.realLinesOfCode).isEqualTo(3.0)
    }
}
