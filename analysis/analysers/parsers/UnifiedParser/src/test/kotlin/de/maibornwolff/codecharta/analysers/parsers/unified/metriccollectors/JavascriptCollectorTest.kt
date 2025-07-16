package de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors

import org.assertj.core.api.Assertions
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.treesitter.TSParser
import org.treesitter.TreeSitterJavascript
import java.io.File

class JavascriptCollectorTest {
    private var parser = TSParser()
    private val collector = JavascriptCollector()

    @BeforeEach
    fun setUp() {
        parser.setLanguage(TreeSitterJavascript())
    }

    private fun createTestFile(content: String): File {
        val tempFile = File.createTempFile("testFile", ".txt")
        tempFile.writeText(content)
        tempFile.deleteOnExit()
        return tempFile
    }

    @Test
    fun `should count for in loop for complexity`() {
        // given
        val fileContent = """
                for (let x in person) {
                  text += person[x];
                }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes["complexity"]).isEqualTo(1)
    }

    @Test
    fun `should count ternary operator for complexity`() {
        // given
        val fileContent = """x = (y>0) ? 1 : -1;"""
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes["complexity"]).isEqualTo(1)
    }

    @Test
    fun `should count and operator for complexity`() {
        // given
        val fileContent = """if (x == 0 && y < 1) return true"""
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes["complexity"]).isEqualTo(2)
    }

    @Test
    fun `should count nullish operator for complexity`() {
        // given
        val fileContent = """x = y ?? 0"""
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes["complexity"]).isEqualTo(1)
    }

    @Test
    fun `should count line and block comments for comment_lines`() {
        val fileContent = """
            /**
             * docstring comment
             * over
             * multiple lines
             */
             function helloWorld() {
                 //line comment
                 console.log("Hello"); /* comment in code */ console.log("world")
             }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes["comment_lines"]).isEqualTo(7)
    }

    @Test
    fun `should not include comments or empty lines for rloc`() {
        // given
        val fileContent = """
            if (x == 2) {
                // comment


                return true
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes["rloc"]).isEqualTo(3)
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
        Assertions.assertThat(result.attributes["loc"]).isEqualTo(6)
    }
}
