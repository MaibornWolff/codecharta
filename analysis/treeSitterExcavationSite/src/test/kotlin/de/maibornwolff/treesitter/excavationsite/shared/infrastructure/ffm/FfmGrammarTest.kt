package de.maibornwolff.treesitter.excavationsite.shared.infrastructure.ffm

import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.assertThatThrownBy
import org.junit.jupiter.api.Test
import java.lang.foreign.MemorySegment

class FfmGrammarTest {
    private val grammar = FfmGrammar(MemorySegment.NULL, arrayOf("end", "identifier"))

    @Test
    fun `should name a symbol of the grammar`() {
        // Act
        val name = grammar.symbolName(1)

        // Assert
        assertThat(name).isEqualTo("identifier")
    }

    @Test
    fun `should name the builtin error symbol that is not part of the grammar`() {
        // Arrange
        val builtinErrorSymbol = 0xFFFF.toShort()

        // Act
        val name = grammar.symbolName(builtinErrorSymbol)

        // Assert
        assertThat(name).isEqualTo("ERROR")
    }

    @Test
    fun `should name the builtin error repeat symbol that is not part of the grammar`() {
        // Arrange
        val builtinErrorRepeatSymbol = 0xFFFE.toShort()

        // Act
        val name = grammar.symbolName(builtinErrorRepeatSymbol)

        // Assert
        assertThat(name).isEqualTo("_ERROR")
    }

    @Test
    fun `should reject a symbol the grammar does not know`() {
        // Arrange
        val unknownSymbol: Short = 500

        // Act & Assert
        assertThatThrownBy { grammar.symbolName(unknownSymbol) }
            .isInstanceOf(IllegalStateException::class.java)
            .hasMessageContaining("500")
    }
}
