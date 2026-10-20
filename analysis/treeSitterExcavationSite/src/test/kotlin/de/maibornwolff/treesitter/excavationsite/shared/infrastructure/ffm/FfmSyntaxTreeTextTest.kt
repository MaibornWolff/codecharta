package de.maibornwolff.treesitter.excavationsite.shared.infrastructure.ffm

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class FfmSyntaxTreeTextTest : FfmSyntaxTreeTestBase() {
    private fun textsOfType(code: String, wantedType: String): List<String> = FfmSyntaxTree.parse(code, java).use { tree ->
        val texts = mutableListOf<String>()
        tree.walk { node, nodeType -> if (nodeType == wantedType) texts.add(node.text) }
        texts
    }

    @Test
    fun `should report the offsets of a node in UTF-8 bytes`() {
        // Arrange
        val twoByteCharacter = "ä"
        val code = "/*$twoByteCharacter*/class A { int x; }"

        FfmSyntaxTree.parse(code, java).use { tree ->
            // Act
            val name = tree.rootNode.getChild(1).getChildByFieldName("name")

            // Assert
            assertThat(name.text).isEqualTo("A")
            assertThat(listOf(name.startByte, name.endByte)).containsExactly(12, 13)
        }
    }

    @Test
    fun `should return non-ASCII text and the text after it unshifted`() {
        // Arrange
        val code = "class Größe { String 名前 = \"😀 ä\"; int after; }"

        // Act
        val identifiers = textsOfType(code, "identifier")
        val strings = textsOfType(code, "string_literal")

        // Assert
        assertThat(identifiers).containsExactly("Größe", "名前", "after")
        assertThat(strings).containsExactly("\"😀 ä\"")
    }

    @Test
    fun `should return the text of a node that ends with the file`() {
        // Arrange
        val code = "class A {} // schließt"

        // Act
        val comments = textsOfType(code, "line_comment")

        // Assert
        assertThat(comments).containsExactly("// schließt")
    }

    @Test
    fun `should return the whole source as the text of the root`() {
        // Arrange
        val code = "class A { String s = \"ä\"; }"

        // Act
        val rootText = FfmSyntaxTree.parse(code, java).use { tree -> tree.rootNode.text }

        // Assert
        assertThat(rootText).isEqualTo(code)
    }

    @Test
    fun `should return an empty text for a missing node`() {
        // Arrange
        val codeMissingASemicolon = "class A { int x }"

        // Act
        val textsOfEmptyNodes = FfmSyntaxTree.parse(codeMissingASemicolon, java).use { tree ->
            val texts = mutableListOf<String>()
            tree.walk { node, _ -> if (node.startByte == node.endByte) texts.add(node.text) }
            texts
        }

        // Assert
        assertThat(textsOfEmptyNodes).containsExactly("")
    }

    @Test
    fun `should not shift the text after a byte order mark`() {
        // Arrange
        val byteOrderMark = "\uFEFF"
        val code = byteOrderMark + "class A { int x; }"

        // Act
        val identifiers = textsOfType(code, "identifier")

        // Assert
        assertThat(identifiers).containsExactly("A", "x")
    }
}
