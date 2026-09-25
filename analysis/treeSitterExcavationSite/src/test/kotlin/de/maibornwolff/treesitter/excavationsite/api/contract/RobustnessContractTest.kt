package de.maibornwolff.treesitter.excavationsite.api.contract

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterExtraction
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterMetrics
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.EnumSource

/**
 * Contract tests for robustness, determinism, error handling, and zero-case behavior.
 * These tests ensure the library handles edge cases gracefully across all 19 languages.
 */
class RobustnessContractTest {
    @Nested
    inner class EmptyInputContract {
        @ParameterizedTest
        @EnumSource(Language::class)
        fun `should return valid result with zero metrics for empty string`(language: Language) {
            // Act
            val result = TreeSitterMetrics.parse("", language)

            // Assert
            assertThat(result.metrics).isNotNull
            assertThat(result.complexity).isEqualTo(0.0)
            assertThat(result.numberOfFunctions).isEqualTo(0.0)
        }

        @ParameterizedTest
        @EnumSource(Language::class)
        fun `should return valid result for whitespace-only input`(language: Language) {
            // Arrange
            val code = "   \t\t   "

            // Act
            val result = TreeSitterMetrics.parse(code, language)

            // Assert
            assertThat(result.metrics).isNotNull
            assertThat(result.complexity).isEqualTo(0.0)
        }

        @ParameterizedTest
        @EnumSource(Language::class)
        fun `should return valid result for single newline`(language: Language) {
            // Act
            val result = TreeSitterMetrics.parse("\n", language)

            // Assert
            assertThat(result.metrics).isNotNull
        }

        @ParameterizedTest
        @EnumSource(Language::class)
        fun `should return valid result for single character input`(language: Language) {
            // Act
            val result = TreeSitterMetrics.parse("x", language)

            // Assert
            assertThat(result.metrics).isNotNull
        }

        @ParameterizedTest
        @EnumSource(Language::class)
        fun `should return empty lists for empty string extraction`(language: Language) {
            // Act
            val result = TreeSitterExtraction.extract("", language)

            // Assert
            assertThat(result.extractedTexts).isEmpty()
            assertThat(result.identifiers).isEmpty()
            assertThat(result.comments).isEmpty()
            assertThat(result.strings).isEmpty()
        }

        @ParameterizedTest
        @EnumSource(Language::class)
        fun `should return empty lists for whitespace-only extraction`(language: Language) {
            // Arrange
            val code = "   \t\t   \n\n   "

            // Act
            val result = TreeSitterExtraction.extract(code, language)

            // Assert
            assertThat(result.identifiers).isEmpty()
            assertThat(result.comments).isEmpty()
            assertThat(result.strings).isEmpty()
        }
    }

    @Nested
    inner class EdgeCaseInputContract {
        @ParameterizedTest
        @EnumSource(Language::class)
        fun `should handle minimal valid code as identifier`(language: Language) {
            // Arrange
            val code = "x"

            // Act
            val metricsResult = TreeSitterMetrics.parse(code, language)
            val extractionResult = TreeSitterExtraction.extract(code, language)

            // Assert
            assertThat(metricsResult.metrics).isNotNull
            assertThat(extractionResult.extractedTexts).isNotNull
        }

        @Test
        fun `should handle code with only comments for Java`() {
            // Arrange
            val code = "// This is a comment"

            // Act
            val result = TreeSitterMetrics.parse(code, Language.JAVA)

            // Assert
            assertThat(result.metrics).isNotNull
            assertThat(result.commentLines).isGreaterThanOrEqualTo(0.0)
        }

        @Test
        fun `should handle code with only comments for Python`() {
            // Arrange
            val code = "# This is a comment"

            // Act
            val result = TreeSitterMetrics.parse(code, Language.PYTHON)

            // Assert
            assertThat(result.metrics).isNotNull
            assertThat(result.commentLines).isGreaterThanOrEqualTo(0.0)
        }

        @Test
        fun `should handle code with only strings for Kotlin`() {
            // Arrange
            val code = "\"hello world\""

            // Act
            val result = TreeSitterMetrics.parse(code, Language.KOTLIN)

            // Assert
            assertThat(result.metrics).isNotNull
        }
    }

    @Nested
    inner class MalformedCodeContract {
        @ParameterizedTest
        @EnumSource(Language::class)
        fun `should not throw exception for unclosed brace`(language: Language) {
            // Arrange
            val code = "function test() {"

            // Act
            val result = TreeSitterMetrics.parse(code, language)

            // Assert
            assertThat(result.metrics).isNotNull
        }

        @ParameterizedTest
        @EnumSource(Language::class)
        fun `should not throw exception for unclosed string`(language: Language) {
            // Arrange
            val code = "var x = \"unclosed string"

            // Act
            val result = TreeSitterMetrics.parse(code, language)

            // Assert
            assertThat(result.metrics).isNotNull
        }

        @ParameterizedTest
        @EnumSource(Language::class)
        fun `should not throw exception for incomplete function`(language: Language) {
            // Arrange
            val code = "def foo(a, b"

            // Act
            val result = TreeSitterMetrics.parse(code, language)

            // Assert
            assertThat(result.metrics).isNotNull
        }

        @ParameterizedTest
        @EnumSource(Language::class)
        fun `should not throw exception for random garbage text`(language: Language) {
            // Arrange
            val code = "!@#$%^&*()_+-=[]{}|;':\",./<>?"

            // Act
            val result = TreeSitterMetrics.parse(code, language)

            // Assert
            assertThat(result.metrics).isNotNull
        }

        @ParameterizedTest
        @EnumSource(Language::class)
        fun `should not throw exception for binary content`(language: Language) {
            // Arrange
            val code = String(byteArrayOf(0x00, 0x01, 0x02, 0xFF.toByte(), 0xFE.toByte()))

            // Act
            val result = TreeSitterMetrics.parse(code, language)

            // Assert
            assertThat(result.metrics).isNotNull
        }

        @Test
        fun `should extract identifiers from partially valid Java code`() {
            // Arrange
            val code = """
                public class Test {
                    public void validMethod() {
                        int x = 5;
                    // Missing closing braces
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.JAVA)

            // Assert
            assertThat(result.identifiers).isNotEmpty
        }

        @Test
        fun `should calculate some metrics from partially valid Kotlin code`() {
            // Arrange
            val code = """
                fun validFunction() {
                    if (true) {
                        println("hello")
                // Missing closing braces
            """.trimIndent()

            // Act
            val result = TreeSitterMetrics.parse(code, Language.KOTLIN)

            // Assert
            assertThat(result.metrics).isNotEmpty
        }
    }

    @Nested
    inner class IncompleteCodeContract {
        @ParameterizedTest
        @EnumSource(Language::class)
        fun `should handle truncated file gracefully`(language: Language) {
            // Arrange
            val code = "class Foo { void bar() { if (x) { while (y) { for (i"

            // Act
            val result = TreeSitterMetrics.parse(code, language)

            // Assert
            assertThat(result.metrics).isNotNull
        }

        @ParameterizedTest
        @EnumSource(Language::class)
        fun `should handle missing closing delimiters`(language: Language) {
            // Arrange
            val code = "func test(a: int, b: ["

            // Act
            val result = TreeSitterMetrics.parse(code, language)

            // Assert
            assertThat(result.metrics).isNotNull
        }
    }

    @Nested
    inner class DeterminismContract {
        @ParameterizedTest
        @EnumSource(Language::class)
        fun `should return identical metrics for same input parsed twice`(language: Language) {
            // Arrange
            val code = getMinimalCodeSample(language)

            // Act
            val result1 = TreeSitterMetrics.parse(code, language)
            val result2 = TreeSitterMetrics.parse(code, language)

            // Assert
            assertThat(result1.metrics).isEqualTo(result2.metrics)
            assertThat(result1.perFunctionMetrics).isEqualTo(result2.perFunctionMetrics)
        }

        @ParameterizedTest
        @EnumSource(Language::class)
        fun `should return identical metrics for same input parsed 100 times`(language: Language) {
            // Arrange
            val code = getMinimalCodeSample(language)
            val firstResult = TreeSitterMetrics.parse(code, language)

            // Act & Assert
            repeat(100) { iteration ->
                val result = TreeSitterMetrics.parse(code, language)
                assertThat(result.metrics)
                    .withFailMessage("Metrics differed on iteration $iteration for $language")
                    .isEqualTo(firstResult.metrics)
            }
        }

        @ParameterizedTest
        @EnumSource(Language::class)
        fun `should return identical per-function metrics order`(language: Language) {
            // Arrange
            val code = getMinimalCodeSample(language)

            // Act
            val result1 = TreeSitterMetrics.parse(code, language)
            val result2 = TreeSitterMetrics.parse(code, language)

            // Assert
            assertThat(result1.perFunctionMetrics.keys.toList())
                .isEqualTo(result2.perFunctionMetrics.keys.toList())
        }

        @ParameterizedTest
        @EnumSource(Language::class)
        fun `should return identical extraction for same input parsed twice`(language: Language) {
            // Arrange
            val code = getMinimalCodeSample(language)

            // Act
            val result1 = TreeSitterExtraction.extract(code, language)
            val result2 = TreeSitterExtraction.extract(code, language)

            // Assert
            assertThat(result1.extractedTexts).isEqualTo(result2.extractedTexts)
        }

        @ParameterizedTest
        @EnumSource(Language::class)
        fun `should return identifiers in deterministic order`(language: Language) {
            // Arrange
            val code = getMinimalCodeSample(language)

            // Act
            val result1 = TreeSitterExtraction.extract(code, language)
            val result2 = TreeSitterExtraction.extract(code, language)

            // Assert
            assertThat(result1.identifiers).isEqualTo(result2.identifiers)
        }

        @ParameterizedTest
        @EnumSource(Language::class)
        fun `should return comments in deterministic order`(language: Language) {
            // Arrange
            val code = getMinimalCodeSample(language)

            // Act
            val result1 = TreeSitterExtraction.extract(code, language)
            val result2 = TreeSitterExtraction.extract(code, language)

            // Assert
            assertThat(result1.comments).isEqualTo(result2.comments)
        }

        @ParameterizedTest
        @EnumSource(Language::class)
        fun `should return strings in deterministic order`(language: Language) {
            // Arrange
            val code = getMinimalCodeSample(language)

            // Act
            val result1 = TreeSitterExtraction.extract(code, language)
            val result2 = TreeSitterExtraction.extract(code, language)

            // Assert
            assertThat(result1.strings).isEqualTo(result2.strings)
        }
    }

    @Nested
    inner class ZeroCaseBehaviorContract {
        @ParameterizedTest
        @EnumSource(Language::class)
        fun `should return 0 for number_of_functions when no functions exist`(language: Language) {
            // Arrange
            val code = "x = 1"

            // Act
            val result = TreeSitterMetrics.parse(code, language)

            // Assert
            assertThat(result.numberOfFunctions).isEqualTo(0.0)
        }

        @ParameterizedTest
        @EnumSource(Language::class)
        fun `should return 0 for complexity when no functions exist`(language: Language) {
            // Arrange
            val code = "x = 1"

            // Act
            val result = TreeSitterMetrics.parse(code, language)

            // Assert
            assertThat(result.complexity).isEqualTo(0.0)
        }

        @ParameterizedTest
        @EnumSource(Language::class)
        fun `should handle per-function metrics gracefully when no functions`(language: Language) {
            // Arrange
            val code = "x = 1"

            // Act
            val result = TreeSitterMetrics.parse(code, language)

            // Assert - either 0, NaN, or missing key is acceptable
            val maxComplexity = result.perFunctionMetrics["max_complexity_per_function"]
            if (maxComplexity != null) {
                assertThat(maxComplexity.isNaN() || maxComplexity == 0.0).isTrue()
            }
        }

        @ParameterizedTest
        @EnumSource(Language::class)
        fun `should return 0 for comment_lines when no comments exist`(language: Language) {
            // Arrange
            val code = "x = 1"

            // Act
            val result = TreeSitterMetrics.parse(code, language)

            // Assert
            assertThat(result.commentLines).isEqualTo(0.0)
        }

        @ParameterizedTest
        @EnumSource(Language::class)
        fun `should return 0 for comment_ratio when no comments exist`(language: Language) {
            // Arrange
            val code = "x = 1"

            // Act
            val result = TreeSitterMetrics.parse(code, language)

            // Assert
            assertThat(result.commentRatio).isEqualTo(0.0)
        }

        @ParameterizedTest
        @EnumSource(Language::class)
        fun `should return empty list for strings when none exist`(language: Language) {
            // Arrange
            val code = "x = 1"

            // Act
            val result = TreeSitterExtraction.extract(code, language)

            // Assert
            assertThat(result.strings).isEmpty()
        }

        @ParameterizedTest
        @EnumSource(Language::class, names = ["VUE"], mode = EnumSource.Mode.EXCLUDE)
        fun `should return loc greater than or equal to 1 for any non-empty file with newline`(language: Language) {
            // Arrange - file must have at least one newline to count as 1 line
            // Note: Vue is excluded because it uses a preprocessor that extracts script content,
            // so a file without a script section would return 0 LOC
            val code = "x\n"

            // Act
            val result = TreeSitterMetrics.parse(code, language)

            // Assert
            assertThat(result.linesOfCode).isGreaterThanOrEqualTo(1.0)
        }

        @ParameterizedTest
        @EnumSource(Language::class)
        fun `should return rloc greater than or equal to 0 for any file`(language: Language) {
            // Arrange
            val code = "x"

            // Act
            val result = TreeSitterMetrics.parse(code, language)

            // Assert
            assertThat(result.realLinesOfCode).isGreaterThanOrEqualTo(0.0)
        }
    }

    @Nested
    inner class MetricBoundaryContract {
        @ParameterizedTest
        @EnumSource(Language::class)
        fun `should never return negative complexity`(language: Language) {
            // Arrange
            val code = getMinimalCodeSample(language)

            // Act
            val result = TreeSitterMetrics.parse(code, language)

            // Assert
            assertThat(result.complexity).isGreaterThanOrEqualTo(0.0)
            assertThat(result.logicComplexity).isGreaterThanOrEqualTo(0.0)
        }

        @ParameterizedTest
        @EnumSource(Language::class)
        fun `should never return negative loc`(language: Language) {
            // Arrange
            val code = getMinimalCodeSample(language)

            // Act
            val result = TreeSitterMetrics.parse(code, language)

            // Assert
            assertThat(result.linesOfCode).isGreaterThanOrEqualTo(0.0)
        }

        @ParameterizedTest
        @EnumSource(Language::class)
        fun `should never return negative rloc`(language: Language) {
            // Arrange
            val code = getMinimalCodeSample(language)

            // Act
            val result = TreeSitterMetrics.parse(code, language)

            // Assert
            assertThat(result.realLinesOfCode).isGreaterThanOrEqualTo(0.0)
        }

        @ParameterizedTest
        @EnumSource(Language::class)
        fun `should never return negative comment_lines`(language: Language) {
            // Arrange
            val code = getMinimalCodeSample(language)

            // Act
            val result = TreeSitterMetrics.parse(code, language)

            // Assert
            assertThat(result.commentLines).isGreaterThanOrEqualTo(0.0)
        }

        @ParameterizedTest
        @EnumSource(Language::class)
        fun `should return comment_ratio between 0 and 1`(language: Language) {
            // Arrange
            val code = getMinimalCodeSample(language)

            // Act
            val result = TreeSitterMetrics.parse(code, language)

            // Assert
            assertThat(result.commentRatio).isBetween(0.0, 1.0)
        }

        @ParameterizedTest
        @EnumSource(Language::class)
        fun `should never return negative number_of_functions`(language: Language) {
            // Arrange
            val code = getMinimalCodeSample(language)

            // Act
            val result = TreeSitterMetrics.parse(code, language)

            // Assert
            assertThat(result.numberOfFunctions).isGreaterThanOrEqualTo(0.0)
        }
    }

    companion object {
        /**
         * Returns a minimal but valid code sample for the given language
         * that includes a function, comment, and string literal.
         */
        private fun getMinimalCodeSample(language: Language): String = when (language) {
            Language.JAVA -> """
                    // Comment
                    public class Test {
                        public void foo() {
                            String s = "hello";
                            if (true) {}
                        }
                    }
            """.trimIndent()
            Language.KOTLIN -> """
                    // Comment
                    fun foo() {
                        val s = "hello"
                        if (true) {}
                    }
            """.trimIndent()
            Language.TYPESCRIPT, Language.JAVASCRIPT -> """
                    // Comment
                    function foo() {
                        let s = "hello";
                        if (true) {}
                    }
            """.trimIndent()
            Language.TSX -> """
                    // Comment
                    const Foo = () => {
                        const s = "hello";
                        return <div>{s}</div>;
                    };
            """.trimIndent()
            Language.PYTHON -> """
                    # Comment
                    def foo():
                        s = "hello"
                        if True:
                            pass
            """.trimIndent()
            Language.GO -> """
                    // Comment
                    package main
                    func foo() {
                        s := "hello"
                        if true {}
                    }
            """.trimIndent()
            Language.PHP -> """
                    <?php
                    // Comment
                    function foo() {
                        ${"$"}s = "hello";
                        if (true) {}
                    }
            """.trimIndent()
            Language.RUBY -> """
                    # Comment
                    def foo
                        s = "hello"
                        if true
                        end
                    end
            """.trimIndent()
            Language.SWIFT -> """
                    // Comment
                    func foo() {
                        let s = "hello"
                        if true {}
                    }
            """.trimIndent()
            Language.BASH -> """
                    # Comment
                    foo() {
                        s="hello"
                        if true; then
                            :
                        fi
                    }
            """.trimIndent()
            Language.CSHARP -> """
                    // Comment
                    public class Test {
                        public void Foo() {
                            string s = "hello";
                            if (true) {}
                        }
                    }
            """.trimIndent()
            Language.CPP, Language.C -> """
                    // Comment
                    void foo() {
                        char* s = "hello";
                        if (1) {}
                    }
            """.trimIndent()
            Language.OBJECTIVE_C -> """
                    // Comment
                    void foo() {
                        NSString* s = @"hello";
                        if (1) {}
                    }
            """.trimIndent()
            Language.VUE -> """
                    <script>
                    // Comment
                    function foo() {
                        let s = "hello";
                        if (true) {}
                    }
                    </script>
            """.trimIndent()
            Language.ABL -> "// Comment\nPROCEDURE foo:\nDEFINE VARIABLE s AS CHARACTER NO-UNDO.\ns = \"hello\".\nEND PROCEDURE."
            Language.DELPHI -> "// Comment\nprocedure foo;\nbegin if True then WriteLn('hello'); end;"
            Language.RUST -> """
                    // Comment
                    fn foo() {
                        let s = "hello";
                        if true {}
                    }
            """.trimIndent()
        }
    }
}
