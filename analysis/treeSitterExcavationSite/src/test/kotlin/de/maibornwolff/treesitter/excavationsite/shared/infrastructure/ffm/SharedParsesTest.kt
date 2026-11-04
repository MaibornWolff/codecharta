package de.maibornwolff.treesitter.excavationsite.shared.infrastructure.ffm

import de.maibornwolff.treesitter.excavationsite.shared.domain.GrammarLibrary
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.assertThatThrownBy
import org.junit.jupiter.api.Test

class SharedParsesTest : FfmSyntaxTreeTestBase() {
    private val code = "class A { int x; }"

    @Test
    fun `should hand a second parse of the same source the tree of the first one within a sharing scope`() {
        // Act
        val (first, second) = SharedParses.sharing {
            val first = FfmSyntaxTree.parse(code, java).use { it }
            val second = FfmSyntaxTree.parse(code, java).use { it }
            first to second
        }

        // Assert
        assertThat(second).isSameAs(first)
    }

    @Test
    fun `should parse the same source anew outside a sharing scope`() {
        // Act
        val first = FfmSyntaxTree.parse(code, java).use { it }
        val second = FfmSyntaxTree.parse(code, java).use { it }

        // Assert
        assertThat(second).isNotSameAs(first)
    }

    @Test
    fun `should not share a tree that is still in use`() {
        // Act
        val (outer, inner) = SharedParses.sharing {
            FfmSyntaxTree.parse(code, java).use { outer -> outer to FfmSyntaxTree.parse(code, java).use { it } }
        }

        // Assert
        assertThat(inner).isNotSameAs(outer)
    }

    @Test
    fun `should not share the tree of another source or another grammar`() {
        // Arrange
        val kotlin = NativeTreeSitter.grammar(GrammarLibrary("kotlin"))

        // Act
        val trees = SharedParses.sharing {
            listOf(
                FfmSyntaxTree.parse(code, java).use { it },
                FfmSyntaxTree.parse("class B { int y; }", java).use { it },
                FfmSyntaxTree.parse(code, kotlin).use { it }
            )
        }

        // Assert
        assertThat(trees.toSet()).hasSize(trees.size)
    }

    @Test
    fun `should read a shared tree the same as a tree of its own`() {
        // Act
        val sharedReads = SharedParses.sharing { List(2) { FfmSyntaxTree.parse(code, java).use(::typesOf) } }

        // Assert
        assertThat(sharedReads).containsExactly(visitedTypes(code), visitedTypes(code))
    }

    @Test
    fun `should close the shared trees when the sharing scope ends`() {
        // Arrange
        val tree = SharedParses.sharing { FfmSyntaxTree.parse(code, java).use { it } }

        // Act & Assert
        assertThatThrownBy { tree.rootNode.childCount }.isInstanceOf(IllegalStateException::class.java)
    }

    private fun typesOf(tree: FfmSyntaxTree): List<String> {
        val types = mutableListOf<String>()
        tree.walk { _, nodeType -> types.add(nodeType) }
        return types
    }
}
