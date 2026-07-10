package de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors

import de.maibornwolff.treesitter.excavationsite.api.AvailableFileMetrics
import de.maibornwolff.treesitter.excavationsite.api.Language
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.Test
import java.io.File

class RustCollectorTest {
    private val collector = TreeSitterLibraryCollector(Language.RUST)

    private fun createTestFile(content: String): File {
        val tempFile = File.createTempFile("testFile", ".txt")
        tempFile.writeText(content)
        tempFile.deleteOnExit()
        return tempFile
    }

    @Test
    fun `should count control flow and logical operators for complexity`() {
        // given
        val fileContent = """
            fn f(x: i32, y: i32, z: i32) -> bool {
                if x > 0 && y < 10 || z == 5 {
                    return true;
                }
                false
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        // function (1) + if (1) + && (1) + || (1)
        Assertions.assertThat(result.attributes[AvailableFileMetrics.COMPLEXITY.metricName]).isEqualTo(4.0)
    }

    @Test
    fun `should count each match arm including wildcard for complexity`() {
        // given
        val fileContent = """
            fn f(x: i32) -> i32 {
                match x {
                    1 => 10,
                    2 => 20,
                    _ => 0,
                }
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        // function (1) + three match arms (3)
        Assertions.assertThat(result.attributes[AvailableFileMetrics.COMPLEXITY.metricName]).isEqualTo(4.0)
    }

    @Test
    fun `should count closure for complexity but not as a function`() {
        // given
        val fileContent = """
            fn f() {
                let add = |a: i32, b: i32| a + b;
                let _ = add;
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableFileMetrics.COMPLEXITY.metricName]).isEqualTo(2.0)
        Assertions.assertThat(result.attributes[AvailableFileMetrics.NUMBER_OF_FUNCTIONS.metricName]).isEqualTo(1.0)
    }

    @Test
    fun `should count line doc and block comments for comment_lines`() {
        // given
        val fileContent = """
            //! Module doc comment.

            // A line comment.
            /// A doc comment.
            fn f() {
                /* a block comment */
                let x = 1;
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableFileMetrics.COMMENT_LINES.metricName]).isEqualTo(4.0)
    }

    @Test
    fun `should count function items and trait signatures but not closures for number of functions`() {
        // given
        val fileContent = """
            fn free() {}

            trait T {
                fn required(&self) -> i32;
                fn provided(&self) -> i32 {
                    let f = || 1;
                    f()
                }
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableFileMetrics.NUMBER_OF_FUNCTIONS.metricName]).isEqualTo(3.0)
    }

    @Test
    fun `should not count self as a parameter`() {
        // given
        val fileContent = """
            struct Foo;
            impl Foo {
                fn method(&self, a: i32, b: i32) -> i32 {
                    a + b
                }
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes["max_parameters_per_function"]).isEqualTo(2.0)
        Assertions.assertThat(result.attributes["min_parameters_per_function"]).isEqualTo(2.0)
    }

    @Test
    fun `should correctly calculate rloc per function metric`() {
        // given
        val fileContent = """
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
        val fileContent = """
            fn f(obj: Thing) {
                obj.a().b().c().d();
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableFileMetrics.MESSAGE_CHAINS.metricName]).isEqualTo(1.0)
    }

    @Test
    fun `should not count short message chains`() {
        // given
        val fileContent = """
            fn f(obj: Thing) {
                obj.a().b();
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableFileMetrics.MESSAGE_CHAINS.metricName]).isEqualTo(0.0)
    }
}
