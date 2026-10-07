package de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.treesitter.TreeSitterJava

class TsNodeSyntaxNodeTest {
    private val java = TreeSitterJava()

    @Test
    fun `should return the text of a node behind multi-byte characters`() {
        // Arrange
        val code = "class Größe { String 名前 = \"😀\"; int after; }"
        val classBody = TsNodeSyntaxNode.parse(code, java).getChild(0).getChildByFieldName("body")

        // Act
        val lastField = classBody.getNamedChild(classBody.namedChildCount - 1)

        // Assert
        assertThat(lastField.text).isEqualTo("int after;")
    }

    @Test
    fun `should report positions and byte offsets of a node`() {
        // Arrange
        val code = "class A {\n  int ä; int x;\n}"
        val classBody = TsNodeSyntaxNode.parse(code, java).getChild(0).getChildByFieldName("body")

        // Act
        val secondField = classBody.getNamedChild(1)

        // Assert
        assertThat(listOf(secondField.startRow, secondField.startColumn, secondField.endRow, secondField.endColumn))
            .containsExactly(1, 10, 1, 16)
        assertThat(listOf(secondField.startByte, secondField.endByte)).containsExactly(20, 26)
    }

    @Test
    fun `should count named children apart from all children`() {
        // Arrange
        val code = "class A { int x; }"

        // Act
        val classBody = TsNodeSyntaxNode.parse(code, java).getChild(0).getChildByFieldName("body")

        // Assert
        assertThat(classBody.childCount).isEqualTo(3)
        assertThat(classBody.namedChildCount).isEqualTo(1)
        assertThat(classBody.getNamedChild(0).type).isEqualTo("field_declaration")
    }

    @Test
    fun `should return null nodes above the root and before the first child`() {
        // Arrange
        val root = TsNodeSyntaxNode.parse("class A {}", java)

        // Act
        val parentOfRoot = root.parent
        val siblingBeforeFirstChild = root.getChild(0).prevSibling

        // Assert
        assertThat(parentOfRoot.isNull).isTrue()
        assertThat(siblingBeforeFirstChild.isNull).isTrue()
    }

    @Test
    fun `should return the previous sibling of a node`() {
        // Arrange
        val classBody = TsNodeSyntaxNode.parse("class A { int x; }", java).getChild(0).getChildByFieldName("body")

        // Act
        val siblingBeforeTheField = classBody.getChild(1).prevSibling

        // Assert
        assertThat(siblingBeforeTheField.type).isEqualTo("{")
    }

    @Test
    fun `should treat two views of the same node as equal`() {
        // Arrange
        val classDeclaration = TsNodeSyntaxNode.parse("class A { int x; }", java).getChild(0)

        // Act
        val sameNodeReachedTwice = classDeclaration.getChildByFieldName("name").parent

        // Assert
        assertThat(sameNodeReachedTwice).isEqualTo(classDeclaration)
        assertThat(sameNodeReachedTwice.hashCode()).isEqualTo(classDeclaration.hashCode())
    }

    @Test
    fun `should tell different nodes apart`() {
        // Arrange
        val classDeclaration = TsNodeSyntaxNode.parse("class A { int x; }", java).getChild(0)

        // Act
        val name = classDeclaration.getChildByFieldName("name")

        // Assert
        assertThat(name).isNotEqualTo(classDeclaration)
        assertThat(name).isNotEqualTo("A")
    }
}
