package de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors

import org.assertj.core.api.Assertions
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.treesitter.TSParser
import org.treesitter.TreeSitterKotlin

class KotlinCollectorTest {
    private var parser = TSParser()
    private val collector = KotlinCollector()

    @BeforeEach
    fun setUp() {
        parser.setLanguage(TreeSitterKotlin())
    }

    @Test
    fun `should count elvis operator for complexity`() {
        // given
        val input = """val y = x ?: 2"""
        val node = parser.parseString(null, input).rootNode

        // when
        val complexity = collector.getComplexity(node)

        // then
        Assertions.assertThat(complexity).isEqualTo(1)
    }

    @Test
    fun `should count conjunction expressions for complexity`() {
        // given
        val input = """if (x == 0 && y < 1) return true"""
        val node = parser.parseString(null, input).rootNode

        // when
        val complexity = collector.getComplexity(node)

        // then
        Assertions.assertThat(complexity).isEqualTo(2)
    }

    @Test
    fun `should count lambda expressions for complexity`() {
        // given
        val input = """val sum = { x: Int, y: Int -> x + y }"""
        val node = parser.parseString(null, input).rootNode

        // when
        val complexity = collector.getComplexity(node)

        // then
        Assertions.assertThat(complexity).isEqualTo(1)
    }

    @Test
    fun `should count each possibility in when case for complexity`() {
        // given
        val input = """
            when (x) {
                1 -> print("x == 1")
                2 -> print("x == 2")
                else -> print("x is neither 1 nor 2")
            }
        """.trimIndent()
        val node = parser.parseString(null, input).rootNode

        // when
        val complexity = collector.getComplexity(node)

        // then
        Assertions.assertThat(complexity).isEqualTo(3)
    }

    @Test
    fun `should count filters and maps for complexity`() {
        // given
        val input = """numberList.filter { it % 2 == 0 }.map { it * 2 }"""
        val node = parser.parseString(null, input).rootNode

        // when
        val complexity = collector.getComplexity(node)

        // then
        Assertions.assertThat(complexity).isEqualTo(2)
    }

    @Test
    fun `should count line and block comments for comment_lines`() {
        // given
        val input = """
            /**
             * docstring comment
             * over
             * multiple lines
             */
            fun helloWorld() {
                // line comment
                println("Hello") /* comment in code */; println("world")
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

                return true
            }
        """.trimIndent() + "\n" // this newline simulates end of file
        val node = parser.parseString(null, input).rootNode

        // when
        val loc = collector.getLinesOfCode(node)

        // then
        Assertions.assertThat(loc).isEqualTo(6)
    }
}
