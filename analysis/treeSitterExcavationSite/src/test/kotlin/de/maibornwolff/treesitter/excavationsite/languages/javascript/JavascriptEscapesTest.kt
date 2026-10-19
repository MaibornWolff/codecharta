package de.maibornwolff.treesitter.excavationsite.languages.javascript

import de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors.unescapeJavascript
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class JavascriptEscapesTest {
    @Test
    fun `should resolve escaped quotes, backslashes and control characters`() {
        // Arrange
        val literal = """a \'b\' \"c\" \\ d\ne\tf"""

        // Act
        val text = unescapeJavascript(literal)

        // Assert
        assertThat(text).isEqualTo("a 'b' \"c\" \\ d\ne\tf")
    }

    @Test
    fun `should resolve hexadecimal and unicode escapes`() {
        // Arrange
        val literal = """H\xf6hle über \u{1F409}"""

        // Act
        val text = unescapeJavascript(literal)

        // Assert
        assertThat(text).isEqualTo("Höhle über 🐉")
    }

    @Test
    fun `should drop a line continuation and keep an unknown escape as its character`() {
        // Arrange
        val literal = "one \\\ntwo \\q"

        // Act
        val text = unescapeJavascript(literal)

        // Assert
        assertThat(text).isEqualTo("one two q")
    }

    @Test
    fun `should keep a code point escape beyond Unicode as written`() {
        // Arrange
        val literal = """a \u{110000} b \u{FFFFFFFFFF} c \u{FFFFFFFFFFFFFFFFFFFFFFFF}"""

        // Act
        val text = unescapeJavascript(literal)

        // Assert
        assertThat(text).isEqualTo(literal)
    }

    @Test
    fun `should resolve the highest code point of Unicode, also behind leading zeros`() {
        // Arrange
        val literal = """\u{10FFFF}\u{0010FFFF}"""

        // Act
        val text = unescapeJavascript(literal)

        // Assert
        assertThat(text).isEqualTo(String(Character.toChars(0x10FFFF)).repeat(2))
    }
}
