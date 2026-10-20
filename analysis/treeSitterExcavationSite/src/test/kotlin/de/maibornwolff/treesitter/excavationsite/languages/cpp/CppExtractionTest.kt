package de.maibornwolff.treesitter.excavationsite.languages.cpp

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterExtraction
import de.maibornwolff.treesitter.excavationsite.shared.domain.ExtractionContext
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class CppExtractionTest {
    @Test
    fun `should correctly categorize extracted items by context`() {
        // Arrange
        val code = """
            // Process the order
            class Order {
                int id;
            };

            int processOrder(const char* msg) {
                return 0;
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("Order", "id", "processOrder", "msg")
        assertThat(result.comments).containsExactly("Process the order")
    }

    @Test
    fun `should provide access via extractedTexts list`() {
        // Arrange
        val code = """
            // Comment
            int foo;
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.extractedTexts.map { it.context }).containsExactly(
            ExtractionContext.COMMENT,
            ExtractionContext.IDENTIFIER
        )
    }

    @Test
    fun `should report extraction is supported for Cpp`() {
        // Act & Assert
        assertThat(TreeSitterExtraction.isExtractionSupported(Language.CPP)).isTrue()
        assertThat(TreeSitterExtraction.isExtractionSupported(".cpp")).isTrue()
    }

    @Test
    fun `should return Cpp in supported languages`() {
        // Act & Assert
        assertThat(TreeSitterExtraction.isExtractionSupported(Language.CPP)).isTrue()
    }

    @Test
    fun `should return cpp in supported extensions`() {
        // Act & Assert
        assertThat(TreeSitterExtraction.isExtractionSupported(".cpp")).isTrue()
    }

    @Test
    fun `should support header file extensions`() {
        // Act & Assert
        assertThat(TreeSitterExtraction.isExtractionSupported(".hpp")).isTrue()
        assertThat(TreeSitterExtraction.isExtractionSupported(".h")).isTrue()
        assertThat(TreeSitterExtraction.isExtractionSupported(".cc")).isTrue()
        assertThat(TreeSitterExtraction.isExtractionSupported(".cxx")).isTrue()
        assertThat(TreeSitterExtraction.isExtractionSupported(".hxx")).isTrue()
    }
}
