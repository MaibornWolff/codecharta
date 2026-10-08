package de.maibornwolff.treesitter.excavationsite.shared.domain

import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.jni.TsNodeSyntaxNode
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.treesitter.TreeSitterJava

class TreeTraversalTest {
    private val java = TreeSitterJava()

    @Nested
    inner class FindAllDescendantsOfType {
        @Test
        fun `should find descendants of a single type`() {
            // Arrange
            val code = """
                public class Foo {
                    private int x;
                    private String y;
                }
            """.trimIndent()
            val rootNode = TsNodeSyntaxNode.parse(code, java)

            // Act
            val fields = TreeTraversal.findAllDescendantsOfType(rootNode, "field_declaration")

            // Assert
            assertThat(fields).hasSize(2)
            assertThat(fields.all { it.type == "field_declaration" }).isTrue()
        }

        @Test
        fun `should find descendants of multiple types`() {
            // Arrange
            val code = """
                public class Foo {
                    private int x;
                    public void bar() {}
                }
            """.trimIndent()
            val rootNode = TsNodeSyntaxNode.parse(code, java)

            // Act
            val nodes = TreeTraversal.findAllDescendantsOfType(rootNode, "field_declaration", "method_declaration")

            // Assert
            assertThat(nodes).hasSize(2)
            assertThat(nodes.map { it.type }).containsExactlyInAnyOrder("field_declaration", "method_declaration")
        }

        @Test
        fun `should find nested matches at arbitrary depth`() {
            // Arrange
            val code = """
                public class Foo {
                    public void bar() {
                        Logger.info("test");
                        new Calculator().compute();
                    }
                }
            """.trimIndent()
            val rootNode = TsNodeSyntaxNode.parse(code, java)

            // Act
            val invocations = TreeTraversal.findAllDescendantsOfType(rootNode, "method_invocation")

            // Assert
            assertThat(invocations).hasSize(2)
        }

        @Test
        fun `should find descendants in the order they appear in the source`() {
            // Arrange
            val code = "class Outer { int first; class Inner { int second; } int third; }"
            val rootNode = TsNodeSyntaxNode.parse(code, java)

            // Act
            val matches = TreeTraversal.findAllDescendantsOfType(rootNode, "field_declaration", "class_declaration")

            // Assert
            assertThat(matches.map { it.text.substringBefore(" {") })
                .containsExactly("class Outer", "int first;", "class Inner", "int second;", "int third;")
        }

        @Test
        fun `should find descendants of code nested too deeply for a recursive descent`() {
            // Arrange
            val concatenatedStrings = 50_000
            val code = "class A { String s = " + "\"a\" + ".repeat(concatenatedStrings - 1) + "\"a\"; }"
            val rootNode = TsNodeSyntaxNode.parse(code, java)

            // Act
            val strings = TreeTraversal.findAllDescendantsOfType(rootNode, "string_literal")

            // Assert
            assertThat(strings).hasSize(concatenatedStrings)
        }

        @Test
        fun `should return empty list when no matches found`() {
            // Arrange
            val code = """
                public class Foo {}
            """.trimIndent()
            val rootNode = TsNodeSyntaxNode.parse(code, java)

            // Act
            val fields = TreeTraversal.findAllDescendantsOfType(rootNode, "field_declaration")

            // Assert
            assertThat(fields).isEmpty()
        }
    }

    @Nested
    inner class FindAllDescendantsByTypes {
        @Test
        fun `should bucket descendants by type`() {
            // Arrange
            val code = """
                public class Foo {
                    private int x;
                    public void bar() {}
                }
            """.trimIndent()
            val rootNode = TsNodeSyntaxNode.parse(code, java)

            // Act
            val buckets = TreeTraversal.findAllDescendantsGroupedByType(
                rootNode,
                setOf("field_declaration", "method_declaration")
            )

            // Assert
            assertThat(buckets).hasSize(2)
            assertThat(buckets["field_declaration"]).hasSize(1)
            assertThat(buckets["method_declaration"]).hasSize(1)
        }

        @Test
        fun `should return empty map when no matches found`() {
            // Arrange
            val code = """
                public class Foo {}
            """.trimIndent()
            val rootNode = TsNodeSyntaxNode.parse(code, java)

            // Act
            val buckets = TreeTraversal.findAllDescendantsGroupedByType(
                rootNode,
                setOf("field_declaration")
            )

            // Assert
            assertThat(buckets).isEmpty()
        }

        @Test
        fun `should only include keys for requested types`() {
            // Arrange
            val code = """
                public class Foo {
                    private int x;
                    public void bar() {}
                }
            """.trimIndent()
            val rootNode = TsNodeSyntaxNode.parse(code, java)

            // Act
            val buckets = TreeTraversal.findAllDescendantsGroupedByType(
                rootNode,
                setOf("field_declaration")
            )

            // Assert
            assertThat(buckets).containsOnlyKeys("field_declaration")
            assertThat(buckets["field_declaration"]).hasSize(1)
        }
    }

    @Nested
    inner class ContainsNodeOfType {
        private val rootNode = TsNodeSyntaxNode.parse("class A { void f() { g(x -> x); } }", java)

        @Test
        fun `should find a type that occurs deep below the node`() {
            // Act
            val containsLambda = TreeTraversal.containsNodeOfType(rootNode, "lambda_expression")

            // Assert
            assertThat(containsLambda).isTrue()
        }

        @Test
        fun `should not find the type of the node itself or a type that does not occur`() {
            // Act
            val containsItself = TreeTraversal.containsNodeOfType(rootNode, "program")
            val containsField = TreeTraversal.containsNodeOfType(rootNode, "field_declaration")

            // Assert
            assertThat(containsItself).isFalse()
            assertThat(containsField).isFalse()
        }
    }
}
