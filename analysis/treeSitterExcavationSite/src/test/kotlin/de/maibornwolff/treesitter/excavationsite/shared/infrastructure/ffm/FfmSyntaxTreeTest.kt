package de.maibornwolff.treesitter.excavationsite.shared.infrastructure.ffm

import de.maibornwolff.treesitter.excavationsite.shared.domain.GrammarLibrary
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.assertThatThrownBy
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test

class FfmSyntaxTreeTest {
    private val java = NativeTreeSitter.grammar(GrammarLibrary("java"))

    private fun visitedTypes(code: String): List<String> = FfmSyntaxTree.parse(code, java).use { tree ->
        val types = mutableListOf<String>()
        tree.walk { _, nodeType -> types.add(nodeType) }
        types
    }

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
        fun `should walk a file with a million lines`() {
            // Arrange
            val lineCount = 1_000_000
            val code = "class A {\n" + "int x;\n".repeat(lineCount) + "}"

            // Act
            val types = visitedTypes(code)

            // Assert
            assertThat(types.count { it == "field_declaration" }).isEqualTo(lineCount)
        }
    }

    @Nested
    inner class Nodes {
        @Test
        fun `should report zero-based rows and columns`() {
            FfmSyntaxTree.parse("class A {\n  int x;\n}", java).use { tree ->
                // Arrange
                val classBody = tree.rootNode.getChild(0).getChildByFieldName("body")

                // Act
                val field = classBody.getChild(1)

                // Assert
                assertThat(field.type).isEqualTo("field_declaration")
                assertThat(listOf(field.startRow, field.startColumn, field.endRow, field.endColumn)).containsExactly(1, 2, 1, 8)
            }
        }

        @Test
        fun `should count columns in UTF-8 bytes`() {
            FfmSyntaxTree.parse("class A { String ä = \"😀\"; int x; }", java).use { tree ->
                // Arrange
                val classBody = tree.rootNode.getChild(0).getChildByFieldName("body")

                // Act
                val fieldAfterNonAsciiText = classBody.getChild(2)

                // Assert
                assertThat(fieldAfterNonAsciiText.type).isEqualTo("field_declaration")
                assertThat(fieldAfterNonAsciiText.startColumn).isEqualTo(30)
            }
        }

        @Test
        fun `should return a null node for a field the node does not have`() {
            FfmSyntaxTree.parse("class A {}", java).use { tree ->
                // Act
                val missingChild = tree.rootNode.getChild(0).getChildByFieldName("no_such_field")

                // Assert
                assertThat(missingChild.isNull).isTrue()
            }
        }

        @Test
        fun `should return a null node for a child index out of range`() {
            FfmSyntaxTree.parse("class A {}", java).use { tree ->
                // Arrange
                val root = tree.rootNode

                // Act
                val missingChild = root.getChild(root.childCount)

                // Assert
                assertThat(missingChild.isNull).isTrue()
            }
        }

        @Test
        fun `should return a null node as the parent of the root`() {
            FfmSyntaxTree.parse("class A {}", java).use { tree ->
                // Act
                val parentOfRoot = tree.rootNode.parent

                // Assert
                assertThat(parentOfRoot.isNull).isTrue()
            }
        }

        @Test
        fun `should return the parent of a child`() {
            FfmSyntaxTree.parse("class A {}", java).use { tree ->
                // Arrange
                val classDeclaration = tree.rootNode.getChild(0)

                // Act
                val parent = classDeclaration.getChildByFieldName("name").parent

                // Assert
                assertThat(parent.isNull).isFalse()
                assertThat(parent.type).isEqualTo("class_declaration")
                assertThat(parent.childCount).isEqualTo(classDeclaration.childCount)
            }
        }
    }

    @Nested
    inner class Lifetime {
        @Test
        fun `should refuse to read a node after its tree was closed`() {
            // Arrange
            val tree = FfmSyntaxTree.parse("class A {}", java)
            val root = tree.rootNode

            // Act
            tree.close()

            // Assert
            assertThatThrownBy { root.type }.isInstanceOf(IllegalStateException::class.java)
        }

        @Test
        fun `should refuse to read a tree on another thread than the one that parsed it`() {
            FfmSyntaxTree.parse("class A {}", java).use { tree ->
                // Arrange
                val root = tree.rootNode
                var failure: Throwable? = null

                // Act
                Thread { failure = runCatching { root.type }.exceptionOrNull() }.apply { start() }.join()

                // Assert
                assertThat(failure).isInstanceOf(WrongThreadException::class.java)
            }
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
