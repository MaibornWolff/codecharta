package de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors

import org.assertj.core.api.Assertions
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.treesitter.TSParser
import org.treesitter.TreeSitterJavascript

class JavascriptCollectorTest {
    private var parser = TSParser()
    private val collector = JavascriptCollector()

    @BeforeEach
    fun setUp() {
        parser.setLanguage(TreeSitterJavascript())
    }

    @Test
    fun `should count for in loop for complexity`() {
        // given
        val input = """
                for (let x in person) {
                  text += person[x];
                }
        """.trimIndent()
        val node = parser.parseString(null, input).rootNode

        // when
        val complexity = collector.getComplexity(node)

        // then
        Assertions.assertThat(complexity).isEqualTo(1)
    }

    @Test
    fun `should count ternary operator for complexity`() {
        // given
        val input = """x = (y>0) ? 1 : -1;"""
        val node = parser.parseString(null, input).rootNode

        // when
        val complexity = collector.getComplexity(node)

        // then
        Assertions.assertThat(complexity).isEqualTo(1)
    }

    @Test
    fun `should count and operator for complexity`() {
        // given
        val input = """if (x == 0 && y < 1) return true"""
        val node = parser.parseString(null, input).rootNode

        // when
        val complexity = collector.getComplexity(node)

        // then
        Assertions.assertThat(complexity).isEqualTo(2)
    }

    @Test
    fun `should count nullish operator for complexity`() {
        // given
        val input = """x = y ?? 0"""
        val node = parser.parseString(null, input).rootNode

        // when
        val complexity = collector.getComplexity(node)

        // then
        Assertions.assertThat(complexity).isEqualTo(1)
    }

    @Test
    fun `should count line and block comments for comment_lines`() {
        val input = """
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
        val node = parser.parseString(null, input).rootNode

        // when
        val commentLines = collector.getCommentLines(node)

        // then
        Assertions.assertThat(commentLines).isEqualTo(7)
    }

    @Test
    fun `should not include comments or empty lines for rloc`() {
        // given
        val input = """
            if (x == 2) {
                // comment


                return true
            }
        """.trimIndent()
        val node = parser.parseString(null, input).rootNode

        // when
        val rloc = collector.getRealLinesOfCode(node)

        // then
        Assertions.assertThat(rloc).isEqualTo(3)
    }

    @Test
    fun `should count empty lines and comments for loc`() {
        // given
        val input = """
            if (x == 2) {
            // comment


            return true;
            }
        """.trimIndent() + "\n" //this newline simulates end of file
        val node = parser.parseString(null, input).rootNode

        // when
        val loc = collector.getLinesOfCode(node)

        // then
        Assertions.assertThat(loc).isEqualTo(6)
    }
}
