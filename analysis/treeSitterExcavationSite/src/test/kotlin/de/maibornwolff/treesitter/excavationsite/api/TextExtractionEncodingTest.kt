package de.maibornwolff.treesitter.excavationsite.api

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class TextExtractionEncodingTest {
    @Test
    fun `should extract unshifted identifiers from a file that starts with a byte order mark`() {
        // Arrange
        val byteOrderMark = "\uFEFF"
        val code = byteOrderMark + "// Licensed\nclass BenchmarkRunner { int assembly; }"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.JAVA)

        // Assert
        assertThat(result.identifiers).containsExactly("BenchmarkRunner", "assembly")
        assertThat(result.comments).containsExactly("Licensed")
    }

    @Test
    fun `should extract unshifted identifiers after the noncharacters U+FFFE and U+FFFF`() {
        // Arrange
        val code = "class A { String range = \"\uFFFE-\uFFFF\"; int afterTheRange; }"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.JAVA)

        // Assert
        assertThat(result.identifiers).containsExactly("A", "range", "afterTheRange")
        assertThat(result.strings).containsExactly("\uFFFE-\uFFFF")
    }

    @Test
    fun `should extract the identifiers on both sides of a form feed`() {
        // Arrange
        val formFeed = "\u000C"
        val code = "int before(void) { return 1; }\n$formFeed\nint after(void) { return 2; }"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly("before", "after")
    }

    @Test
    fun `should extract text after multi-byte characters unshifted`() {
        // Arrange
        val code = "class Größe { String 名前 = \"😀 ä\"; int after; } // schließt"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.JAVA)

        // Assert
        assertThat(result.identifiers).containsExactly("Größe", "名前", "after")
        assertThat(result.strings).containsExactly("😀 ä")
        assertThat(result.comments).containsExactly("schließt")
    }

    @Test
    fun `should extract a lone surrogate as a question mark`() {
        // Arrange
        val loneSurrogate = "\uD83D"
        val code = "class A { String label = \"x${loneSurrogate}y\"; int after; }"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.JAVA)

        // Assert
        assertThat(result.identifiers).containsExactly("A", "label", "after")
        assertThat(result.strings).containsExactly("x?y")
    }
}
