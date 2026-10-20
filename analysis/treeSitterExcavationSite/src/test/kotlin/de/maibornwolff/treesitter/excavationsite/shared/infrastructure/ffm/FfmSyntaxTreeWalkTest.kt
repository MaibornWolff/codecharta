package de.maibornwolff.treesitter.excavationsite.shared.infrastructure.ffm

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test

class FfmSyntaxTreeWalkTest : FfmSyntaxTreeTestBase() {
    @Nested
    inner class Walk {
        @Test
        fun `should visit every node in pre-order`() {
            // Arrange
            val code = "class A { int x; }"

            // Act
            val types = visitedTypes(code)

            // Assert
            assertThat(types).containsExactly(
                "program",
                "class_declaration",
                "class",
                "identifier",
                "class_body",
                "{",
                "field_declaration",
                "integral_type",
                "int",
                "variable_declarator",
                "identifier",
                ";",
                "}"
            )
        }

        @Test
        fun `should visit only the root for empty source`() {
            // Act
            val types = visitedTypes("")

            // Assert
            assertThat(types).containsExactly("program")
        }

        @Test
        fun `should name error nodes of code that does not parse`() {
            // Arrange
            val unparsableCode = "class { ) ] ?? @@ int"

            // Act
            val types = visitedTypes(unparsableCode)

            // Assert
            assertThat("ERROR" in types).isTrue()
        }

        @Test
        fun `should walk deeply nested code without overflowing the stack`() {
            // Arrange
            val nestingDepth = 20_000
            val code = "class A { int x = " + "(".repeat(nestingDepth) + "1" + ")".repeat(nestingDepth) + "; }"

            // Act
            val types = visitedTypes(code)

            // Assert
            assertThat(types.count { it == "parenthesized_expression" }).isEqualTo(nestingDepth)
        }

        @Test
        fun `should walk a file with a hundred thousand lines`() {
            // Arrange
            val lineCount = 100_000
            val code = "class A {\n" + "int x;\n".repeat(lineCount) + "}"

            // Act
            val types = visitedTypes(code)

            // Assert
            assertThat(types.count { it == "field_declaration" }).isEqualTo(lineCount)
        }
    }

    @Nested
    inner class Encoding {
        @Test
        fun `should parse source with a lone surrogate as if it were a question mark`() {
            // Arrange
            val loneSurrogate = '\uD83D'
            val code = "class A { String s = \"$loneSurrogate\"; int x; }"

            // Act
            val types = visitedTypes(code)

            // Assert
            assertThat(types).isEqualTo(visitedTypes(code.replace(loneSurrogate, '?')))
        }

        @Test
        fun `should parse a form feed as the whitespace it is`() {
            // Arrange
            val formFeed = '\u000C'
            val code = "class A { int x;$formFeed int y; }"

            // Act
            val types = visitedTypes(code)

            // Assert
            assertThat(types).isEqualTo(visitedTypes(code.replace(formFeed, ' ')))
        }

        @Test
        fun `should parse source that contains a NUL character up to its end`() {
            // Arrange
            val code = "class A { String s = \"\u0000\"; int x; }"

            // Act
            val types = visitedTypes(code)

            // Assert
            assertThat(types.count { it == "field_declaration" }).isEqualTo(2)
        }
    }
}
