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
}
