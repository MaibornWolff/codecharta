package de.maibornwolff.treesitter.excavationsite.shared.infrastructure.ffm

import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.assertThatThrownBy
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test

class FfmSyntaxTreeNodeTest : FfmSyntaxTreeTestBase() {
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
        fun `should throw instead of crashing when a null node is read`() {
            FfmSyntaxTree.parse("class A {}", java).use { tree ->
                // Arrange
                val nullNode = tree.rootNode.parent

                // Act & Assert
                assertThatThrownBy { nullNode.type }.isInstanceOf(IllegalStateException::class.java)
                assertThatThrownBy { nullNode.childCount }.isInstanceOf(IllegalStateException::class.java)
                assertThatThrownBy { nullNode.startRow }.isInstanceOf(IllegalStateException::class.java)
                assertThatThrownBy { nullNode.parent }.isInstanceOf(IllegalStateException::class.java)
                assertThatThrownBy { nullNode.getChild(0) }.isInstanceOf(IllegalStateException::class.java)
                assertThatThrownBy { nullNode.getChildByFieldName("name") }.isInstanceOf(IllegalStateException::class.java)
                assertThatThrownBy { nullNode.namedChildCount }.isInstanceOf(IllegalStateException::class.java)
                assertThatThrownBy { nullNode.getNamedChild(0) }.isInstanceOf(IllegalStateException::class.java)
                assertThatThrownBy { nullNode.startByte }.isInstanceOf(IllegalStateException::class.java)
                assertThatThrownBy { nullNode.endByte }.isInstanceOf(IllegalStateException::class.java)
                assertThatThrownBy { nullNode.text }.isInstanceOf(IllegalStateException::class.java)
                assertThatThrownBy { nullNode.prevSibling }.isInstanceOf(IllegalStateException::class.java)
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
    inner class Equality {
        @Test
        fun `should treat two views of the same node as equal`() {
            FfmSyntaxTree.parse("class A { int x; }", java).use { tree ->
                // Arrange
                val classDeclaration = tree.rootNode.getChild(0)

                // Act
                val sameNodeReachedTwice = classDeclaration.getChildByFieldName("name").parent

                // Assert
                assertThat(sameNodeReachedTwice).isEqualTo(classDeclaration)
                assertThat(sameNodeReachedTwice.hashCode()).isEqualTo(classDeclaration.hashCode())
            }
        }

        @Test
        fun `should tell different nodes apart`() {
            FfmSyntaxTree.parse("class A { int x; }", java).use { tree ->
                // Arrange
                val classDeclaration = tree.rootNode.getChild(0)

                // Act
                val name = classDeclaration.getChildByFieldName("name")

                // Assert
                assertThat(name).isNotEqualTo(classDeclaration)
                assertThat(name).isNotEqualTo("A")
            }
        }

        @Test
        fun `should tell the same position in two trees apart`() {
            // Arrange
            val code = "class A { int x; }"

            FfmSyntaxTree.parse(code, java).use { firstTree ->
                FfmSyntaxTree.parse(code, java).use { secondTree ->
                    // Act
                    val rootsAreEqual = firstTree.rootNode == secondTree.rootNode

                    // Assert
                    assertThat(rootsAreEqual).isFalse()
                }
            }
        }
    }
}
