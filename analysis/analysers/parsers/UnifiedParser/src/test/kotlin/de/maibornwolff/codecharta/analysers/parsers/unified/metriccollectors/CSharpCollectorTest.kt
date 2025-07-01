package de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors

import org.assertj.core.api.Assertions
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.treesitter.TSParser
import org.treesitter.TreeSitterCSharp

class CSharpCollectorTest {
    private var parser = TSParser()
    private val collector = CSharpCollector()

    @BeforeEach
    fun setUp() {
        parser.setLanguage(TreeSitterCSharp())
    }

    @Test
    fun `should count lambda expressions for complexity`() {
        // given
        val input = """num => num * 5;"""
        val node = parser.parseString(null, input).rootNode

        // when
        val complexity = collector.getComplexity(node)

        // then
        Assertions.assertThat(complexity).isEqualTo(1)
    }

    @Test
    fun `should count conditional expression for complexity`() {
        // given
        val input = """x = (y>0) ? 1 : -1;"""
        val node = parser.parseString(null, input).rootNode

        // when
        val complexity = collector.getComplexity(node)

        // then
        Assertions.assertThat(complexity).isEqualTo(1)
    }

    @Test
    fun `should count 'and' and 'or' patterns for complexity`() {
        // given
        val input = """if (obj is string and not null) { }"""
        val node = parser.parseString(null, input).rootNode

        // when
        val complexity = collector.getComplexity(node)

        // then
        Assertions.assertThat(complexity).isEqualTo(2)
    }

    @Test
    fun `should count binary expressions with && operator for complexity`() {
        // given
        val input = """if (x > 0 && y < 10) { }"""
        val node = parser.parseString(null, input).rootNode

        // when
        val complexity = collector.getComplexity(node)

        // then
        Assertions.assertThat(complexity).isEqualTo(2)
    }

    @Test
    fun `should count null coalescing operator for complexity`() {
        // given
        val input = """string result = name ?? "default";"""
        val node = parser.parseString(null, input).rootNode

        // when
        val complexity = collector.getComplexity(node)

        // then
        Assertions.assertThat(complexity).isEqualTo(1)
    }

    @Test
    fun `should count switch cases for complexity`() {
        // given
        val input = """
            switch (value) {
                case 1:
                    break;
                case 2:
                    break;
                default:
                    break;
            }
        """.trimIndent()
        val node = parser.parseString(null, input).rootNode

        // when
        val complexity = collector.getComplexity(node)

        // then
        Assertions.assertThat(complexity).isEqualTo(3)
    }

    @Test
    fun `should count switch expression arms for complexity`() {
        // given
        val input = """
            string result = value switch {
                1 => "one",
                2 => "two",
                _ => "other"
            };
        """.trimIndent()
        val node = parser.parseString(null, input).rootNode

        // when
        val complexity = collector.getComplexity(node)

        // then
        Assertions.assertThat(complexity).isEqualTo(3)
    }

    @Test
    fun `should count accessor declarations for complexity`() {
        // given
        val input = """
            public class Example {
                public string Name {
                    get => name;
                    set => name = value;
                }
            }
        """.trimIndent()
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
             public void HelloWorld() {
                 //line comment
                 Console.WriteLine("Hello"); /* comment in code */ Console.WriteLine("world");
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


                return true;
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
        """.trimIndent() + "\n" // this newline simulates end of file
        val node = parser.parseString(null, input).rootNode

        // when
        val loc = collector.getLinesOfCode(node)

        // then
        Assertions.assertThat(loc).isEqualTo(6)
    }
}
