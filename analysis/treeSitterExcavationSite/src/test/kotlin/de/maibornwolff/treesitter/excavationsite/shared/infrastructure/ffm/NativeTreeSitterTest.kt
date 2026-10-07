package de.maibornwolff.treesitter.excavationsite.shared.infrastructure.ffm

import de.maibornwolff.treesitter.excavationsite.shared.domain.GrammarLibrary
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.assertThatThrownBy
import org.junit.jupiter.api.Test

class NativeTreeSitterTest {
    @Test
    fun `should load a grammar once and reuse it`() {
        // Arrange
        val library = GrammarLibrary("go")

        // Act
        val first = NativeTreeSitter.grammar(library)
        val second = NativeTreeSitter.grammar(library)

        // Assert
        assertThat(second).isSameAs(first)
    }

    @Test
    fun `should load a grammar whose entry point is named differently than its library`() {
        // Arrange
        val library = GrammarLibrary("c-sharp", "c_sharp")

        // Act
        val grammar = NativeTreeSitter.grammar(library)

        // Assert
        assertThat(FfmSyntaxTree.parse("class A {}", grammar).use { it.rootNode.type }).isEqualTo("compilation_unit")
    }

    @Test
    fun `should name the entry point a grammar library does not export`() {
        // Arrange
        val library = GrammarLibrary("go", "not_go")

        // Act & Assert
        assertThatThrownBy { NativeTreeSitter.grammar(library) }
            .isInstanceOf(UnsatisfiedLinkError::class.java)
            .hasMessageContaining("tree_sitter_not_go")
    }

    @Test
    fun `should name the missing library of a grammar that is not bundled`() {
        // Arrange
        val library = GrammarLibrary("no-such-grammar")

        // Act & Assert
        assertThatThrownBy { NativeTreeSitter.grammar(library) }
            .isInstanceOf(UnsatisfiedLinkError::class.java)
            .hasMessageContaining("tree-sitter-no-such-grammar")
    }
}
