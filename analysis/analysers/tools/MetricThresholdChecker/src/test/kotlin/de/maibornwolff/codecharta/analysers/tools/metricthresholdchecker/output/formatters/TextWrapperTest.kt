package de.maibornwolff.codecharta.analysers.tools.metricthresholdchecker.output.formatters

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class TextWrapperTest {
    @Test
    fun `should return single line when text fits within max width`() {
        // Arrange
        val wrapper = TextWrapper()
        val text = "Short text"
        val maxWidth = 50
        val indent = ""

        // Act
        val result = wrapper.wrap(text, maxWidth, indent)

        // Assert
        assertThat(result).hasSize(1)
        assertThat(result[0]).isEqualTo("Short text")
    }

    @Test
    fun `should wrap text at word boundaries`() {
        // Arrange
        val wrapper = TextWrapper()
        val text = "This is a long text that should be wrapped at word boundaries"
        val maxWidth = 20
        val indent = ""

        // Act
        val result = wrapper.wrap(text, maxWidth, indent)

        // Assert
        assertThat(result).hasSizeGreaterThan(1)
        result.forEach { line ->
            assertThat(line.length).isLessThanOrEqualTo(maxWidth)
        }
    }

    @Test
    fun `should apply indent to wrapped lines`() {
        // Arrange
        val wrapper = TextWrapper()
        val text = "This is a long text that needs wrapping"
        val maxWidth = 20
        val indent = "  "

        // Act
        val result = wrapper.wrap(text, maxWidth, indent)

        // Assert
        assertThat(result).hasSizeGreaterThan(1)
        result.forEach { line ->
            assertThat(line).startsWith(indent)
        }
    }

    @Test
    fun `should handle empty text`() {
        // Arrange
        val wrapper = TextWrapper()
        val text = ""
        val maxWidth = 50
        val indent = ""

        // Act
        val result = wrapper.wrap(text, maxWidth, indent)

        // Assert
        assertThat(result).isEmpty()
    }

    @Test
    fun `should handle single word`() {
        // Arrange
        val wrapper = TextWrapper()
        val text = "SingleWord"
        val maxWidth = 50
        val indent = ""

        // Act
        val result = wrapper.wrap(text, maxWidth, indent)

        // Assert
        assertThat(result).hasSize(1)
        assertThat(result[0]).isEqualTo("SingleWord")
    }

    @Test
    fun `should handle multiple spaces between words`() {
        // Arrange
        val wrapper = TextWrapper()
        val text = "Word1    Word2    Word3"
        val maxWidth = 50
        val indent = ""

        // Act
        val result = wrapper.wrap(text, maxWidth, indent)

        // Assert
        assertThat(result).hasSize(1)
        assertThat(result[0]).contains("Word1")
        assertThat(result[0]).contains("Word2")
        assertThat(result[0]).contains("Word3")
    }

    @Test
    fun `should respect max width with indent`() {
        // Arrange
        val wrapper = TextWrapper()
        val text = "This is a text that should respect indentation"
        val maxWidth = 20
        val indent = "    "

        // Act
        val result = wrapper.wrap(text, maxWidth, indent)

        // Assert
        result.forEach { line ->
            assertThat(line.length).isLessThanOrEqualTo(maxWidth + indent.length)
        }
    }

    @Test
    fun `should not create empty lines`() {
        // Arrange
        val wrapper = TextWrapper()
        val text = "Word1 Word2 Word3"
        val maxWidth = 10
        val indent = ""

        // Act
        val result = wrapper.wrap(text, maxWidth, indent)

        // Assert
        result.forEach { line ->
            assertThat(line).isNotBlank()
        }
    }
}
