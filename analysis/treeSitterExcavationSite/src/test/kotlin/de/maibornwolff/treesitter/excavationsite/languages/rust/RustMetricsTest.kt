package de.maibornwolff.treesitter.excavationsite.languages.rust

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterMetrics
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test

class RustMetricsTest {
    @Nested
    inner class LogicComplexity {
        @Test
        fun `should count if expression for logic complexity`() {
            // Arrange
            val code = """
                fn f(x: i32) {
                    if x > 0 {
                        let _y = x;
                    }
                }
            """.trimIndent()

            // Act
            val result = TreeSitterMetrics.parse(code, Language.RUST)

            // Assert
            assertThat(result.logicComplexity).isEqualTo(1.0)
        }

        @Test
        fun `should count if let expression for logic complexity`() {
            // Arrange
            val code = """
                fn f(opt: Option<i32>) {
                    if let Some(n) = opt {
                        let _y = n;
                    }
                }
            """.trimIndent()

            // Act
            val result = TreeSitterMetrics.parse(code, Language.RUST)

            // Assert
            assertThat(result.logicComplexity).isEqualTo(1.0)
        }

        @Test
        fun `should count while expression for logic complexity`() {
            // Arrange
            val code = """
                fn f(x: i32) {
                    while x > 0 {
                        let _y = x;
                    }
                }
            """.trimIndent()

            // Act
            val result = TreeSitterMetrics.parse(code, Language.RUST)

            // Assert
            assertThat(result.logicComplexity).isEqualTo(1.0)
        }

        @Test
        fun `should count while let expression for logic complexity`() {
            // Arrange
            val code = """
                fn f(iter: Option<i32>) {
                    while let Some(n) = iter {
                        let _y = n;
                    }
                }
            """.trimIndent()

            // Act
            val result = TreeSitterMetrics.parse(code, Language.RUST)

            // Assert
            assertThat(result.logicComplexity).isEqualTo(1.0)
        }

        @Test
        fun `should count for expression for logic complexity`() {
            // Arrange
            val code = """
                fn f() {
                    for i in 0..10 {
                        let _y = i;
                    }
                }
            """.trimIndent()

            // Act
            val result = TreeSitterMetrics.parse(code, Language.RUST)

            // Assert
            assertThat(result.logicComplexity).isEqualTo(1.0)
        }

        @Test
        fun `should count loop expression for logic complexity`() {
            // Arrange
            val code = """
                fn f() {
                    loop {
                        break;
                    }
                }
            """.trimIndent()

            // Act
            val result = TreeSitterMetrics.parse(code, Language.RUST)

            // Assert
            assertThat(result.logicComplexity).isEqualTo(1.0)
        }

        @Test
        fun `should count logical and or operators for logic complexity`() {
            // Arrange
            val code = """
                fn f(a: bool, b: bool, c: bool) -> bool {
                    a && b || c
                }
            """.trimIndent()

            // Act
            val result = TreeSitterMetrics.parse(code, Language.RUST)

            // Assert
            assertThat(result.logicComplexity).isEqualTo(2.0)
        }

        @Test
        fun `should count each match arm including wildcard for logic complexity`() {
            // Arrange
            val code = """
                fn f(x: i32) -> i32 {
                    match x {
                        1 => 10,
                        2 => 20,
                        _ => 0,
                    }
                }
            """.trimIndent()

            // Act
            val result = TreeSitterMetrics.parse(code, Language.RUST)

            // Assert
            assertThat(result.logicComplexity).isEqualTo(3.0)
        }

        @Test
        fun `should sum nested control flow for logic complexity`() {
            // Arrange
            val code = """
                fn f(x: i32, y: i32) {
                    if x > 0 {
                        while y < 10 {
                            for i in 0..y {
                                let _z = i;
                            }
                        }
                    }
                }
            """.trimIndent()

            // Act
            val result = TreeSitterMetrics.parse(code, Language.RUST)

            // Assert
            assertThat(result.logicComplexity).isEqualTo(3.0)
        }
    }

    @Nested
    inner class ComplexityExclusions {
        @Test
        fun `should not count question mark operator for logic complexity`() {
            // Arrange
            val code = """
                fn f() -> Result<i32, String> {
                    let x = parse()?;
                    Ok(x)
                }
            """.trimIndent()

            // Act
            val result = TreeSitterMetrics.parse(code, Language.RUST)

            // Assert
            assertThat(result.logicComplexity).isEqualTo(0.0)
        }

        @Test
        fun `should count match arm with guard only once for logic complexity`() {
            // Arrange
            val code = """
                fn f(x: Option<i32>) -> i32 {
                    match x {
                        Some(n) if n > 0 => n,
                        _ => 0,
                    }
                }
            """.trimIndent()

            // Act
            val result = TreeSitterMetrics.parse(code, Language.RUST)

            // Assert
            assertThat(result.logicComplexity).isEqualTo(2.0)
        }

        @Test
        fun `should not count plain else for logic complexity`() {
            // Arrange
            val code = """
                fn f(x: i32) -> i32 {
                    if x > 0 {
                        1
                    } else {
                        2
                    }
                }
            """.trimIndent()

            // Act
            val result = TreeSitterMetrics.parse(code, Language.RUST)

            // Assert
            assertThat(result.logicComplexity).isEqualTo(1.0)
        }

        @Test
        fun `should count else if as nested if for logic complexity`() {
            // Arrange
            val code = """
                fn f(x: i32) -> i32 {
                    if x > 0 {
                        1
                    } else if x < 0 {
                        2
                    } else {
                        3
                    }
                }
            """.trimIndent()

            // Act
            val result = TreeSitterMetrics.parse(code, Language.RUST)

            // Assert
            assertThat(result.logicComplexity).isEqualTo(2.0)
        }
    }

    @Nested
    inner class Closures {
        @Test
        fun `should count closure for complexity but not as a function`() {
            // Arrange
            val code = """
                fn f() {
                    let add = |a: i32, b: i32| a + b;
                    let _ = add;
                }
            """.trimIndent()

            // Act
            val result = TreeSitterMetrics.parse(code, Language.RUST)

            // Assert
            assertThat(result.complexity).isEqualTo(2.0)
            assertThat(result.numberOfFunctions).isEqualTo(1.0)
        }
    }

    @Nested
    inner class NumberOfFunctions {
        @Test
        fun `should count free function for number of functions`() {
            // Arrange
            val code = """
                fn add(a: i32, b: i32) -> i32 {
                    a + b
                }
            """.trimIndent()

            // Act
            val result = TreeSitterMetrics.parse(code, Language.RUST)

            // Assert
            assertThat(result.numberOfFunctions).isEqualTo(1.0)
        }

        @Test
        fun `should count impl method for number of functions`() {
            // Arrange
            val code = """
                struct Foo;
                impl Foo {
                    fn bar(&self) {}
                }
            """.trimIndent()

            // Act
            val result = TreeSitterMetrics.parse(code, Language.RUST)

            // Assert
            assertThat(result.numberOfFunctions).isEqualTo(1.0)
        }

        @Test
        fun `should count trait default method for number of functions`() {
            // Arrange
            val code = """
                trait T {
                    fn provided(&self) -> i32 {
                        42
                    }
                }
            """.trimIndent()

            // Act
            val result = TreeSitterMetrics.parse(code, Language.RUST)

            // Assert
            assertThat(result.numberOfFunctions).isEqualTo(1.0)
        }

        @Test
        fun `should count trait method signature for number of functions`() {
            // Arrange
            val code = """
                trait T {
                    fn required(&self) -> i32;
                }
            """.trimIndent()

            // Act
            val result = TreeSitterMetrics.parse(code, Language.RUST)

            // Assert
            assertThat(result.numberOfFunctions).isEqualTo(1.0)
        }

        @Test
        fun `should count function items and trait signatures but not closures`() {
            // Arrange
            val code = """
                fn free() {}

                trait T {
                    fn required(&self) -> i32;
                    fn provided(&self) -> i32 {
                        let f = || 1;
                        f()
                    }
                }
            """.trimIndent()

            // Act
            val result = TreeSitterMetrics.parse(code, Language.RUST)

            // Assert
            assertThat(result.numberOfFunctions).isEqualTo(3.0)
        }
    }

    @Nested
    inner class ComplexityPerFunction {
        @Test
        fun `should aggregate complexity per function including zero for trait signature`() {
            // Arrange
            val code = """
                trait Shape {
                    fn area(&self) -> f64;
                }

                fn classify(x: i32) -> i32 {
                    if x > 0 {
                        1
                    } else {
                        -1
                    }
                }

                fn complex(a: bool, b: bool, c: bool) -> i32 {
                    if a && b || c {
                        1
                    } else {
                        0
                    }
                }
            """.trimIndent()

            // Act
            val result = TreeSitterMetrics.parse(code, Language.RUST)

            // Assert
            assertThat(result.perFunctionMetrics["max_complexity_per_function"]).isEqualTo(3.0)
            assertThat(result.perFunctionMetrics["min_complexity_per_function"]).isEqualTo(0.0)
            assertThat(result.perFunctionMetrics["mean_complexity_per_function"]).isEqualTo(1.33)
            assertThat(result.perFunctionMetrics["median_complexity_per_function"]).isEqualTo(1.0)
        }
    }

    @Nested
    inner class ParametersPerFunction {
        @Test
        fun `should not count self as a parameter`() {
            // Arrange
            val code = """
                struct Foo;
                impl Foo {
                    fn method(&self, a: i32, b: i32) -> i32 {
                        a + b
                    }
                }
            """.trimIndent()

            // Act
            val result = TreeSitterMetrics.parse(code, Language.RUST)

            // Assert
            assertThat(result.perFunctionMetrics["max_parameters_per_function"]).isEqualTo(2.0)
            assertThat(result.perFunctionMetrics["min_parameters_per_function"]).isEqualTo(2.0)
        }

        @Test
        fun `should not attribute closure parameters to the enclosing function or a closure entry`() {
            // Arrange
            val code = """
                fn outer(a: i32) -> i32 {
                    let add = |x: i32, y: i32| x + y;
                    add(a, a)
                }
            """.trimIndent()

            // Act
            val result = TreeSitterMetrics.parse(code, Language.RUST)

            // Assert - only `outer` counts (1 param); the closure's typed params neither leak nor
            // form their own entry (else max would be 2.0).
            assertThat(result.perFunctionMetrics["max_parameters_per_function"]).isEqualTo(1.0)
            assertThat(result.perFunctionMetrics["min_parameters_per_function"]).isEqualTo(1.0)
        }

        @Test
        fun `should correctly calculate all measures for parameters per function metric`() {
            // Arrange
            val code = """
                fn no_params() {}

                fn three_params(a: i32, b: i32, c: i32) -> i32 {
                    a + b + c
                }

                fn one_param(x: i32) -> i32 {
                    x
                }

                struct Foo;
                impl Foo {
                    fn only_self(&self) {}
                }
            """.trimIndent()

            // Act
            val result = TreeSitterMetrics.parse(code, Language.RUST)

            // Assert
            assertThat(result.perFunctionMetrics["max_parameters_per_function"]).isEqualTo(3.0)
            assertThat(result.perFunctionMetrics["min_parameters_per_function"]).isEqualTo(0.0)
            assertThat(result.perFunctionMetrics["mean_parameters_per_function"]).isEqualTo(1.0)
            assertThat(result.perFunctionMetrics["median_parameters_per_function"]).isEqualTo(0.5)
        }
    }

    @Nested
    inner class RlocPerFunction {
        @Test
        fun `should correctly calculate rloc per function metric`() {
            // Arrange
            val code = """
                fn function_one() {
                    // a comment
                    let first = 1;
                    // another comment
                    let second = first + 1;
                }

                fn function_two(x: i32) -> i32 {
                    x * 2
                }
            """.trimIndent()

            // Act
            val result = TreeSitterMetrics.parse(code, Language.RUST)

            // Assert
            assertThat(result.perFunctionMetrics["max_rloc_per_function"]).isEqualTo(2.0)
            assertThat(result.perFunctionMetrics["min_rloc_per_function"]).isEqualTo(1.0)
            assertThat(result.perFunctionMetrics["mean_rloc_per_function"]).isEqualTo(1.5)
            assertThat(result.perFunctionMetrics["median_rloc_per_function"]).isEqualTo(1.5)
        }
    }

    @Nested
    inner class CommentLines {
        @Test
        fun `should count line doc and block comments`() {
            // Arrange
            val code = """
                //! Module doc comment.

                // A line comment.
                /// A doc comment.
                fn f() {
                    /* a block comment */
                    let x = 1;
                }
            """.trimIndent()

            // Act
            val result = TreeSitterMetrics.parse(code, Language.RUST)

            // Assert
            assertThat(result.commentLines).isEqualTo(4.0)
        }

        @Test
        fun `should count each line of a multiline block comment`() {
            // Arrange
            val code = """
                /*
                 * line one
                 * line two
                 */
                fn f() {}
            """.trimIndent()

            // Act
            val result = TreeSitterMetrics.parse(code, Language.RUST)

            // Assert
            assertThat(result.commentLines).isEqualTo(4.0)
        }
    }

    @Nested
    inner class MessageChains {
        @Test
        fun `should detect message chains with four or more method calls`() {
            // Arrange
            val code = """
                fn f(obj: Thing) {
                    obj.a().b().c().d();
                }
            """.trimIndent()

            // Act
            val result = TreeSitterMetrics.parse(code, Language.RUST)

            // Assert
            assertThat(result.messageChains).isEqualTo(1.0)
        }

        @Test
        fun `should not count short message chains`() {
            // Arrange
            val code = """
                fn f(obj: Thing) {
                    obj.a().b();
                }
            """.trimIndent()

            // Act
            val result = TreeSitterMetrics.parse(code, Language.RUST)

            // Assert
            assertThat(result.messageChains).isEqualTo(0.0)
        }
    }
}
