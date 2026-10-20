package de.maibornwolff.treesitter.excavationsite.languages.cpp

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterExtraction
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class CppCommentAndStringExtractionTest {
    @Test
    fun `should extract single line comment`() {
        // Arrange
        val code = """
            // This is a comment
            int x;
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.comments).hasSize(1)
        assertThat(result.comments[0]).isEqualTo("This is a comment")
    }

    @Test
    fun `should extract block comment`() {
        // Arrange
        val code = """
            /* This is a block comment */
            int x;
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.comments).hasSize(1)
        assertThat(result.comments[0]).isEqualTo("This is a block comment")
    }

    @Test
    fun `should extract doxygen comment`() {
        // Arrange
        val code = """
            /**
             * Calculate the total price.
             * @param count Number of items
             */
            int calculate(int count) {
                return count;
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.comments).containsExactly("Calculate the total price.\n@param count Number of items")
    }

    @Test
    fun `should extract string literal`() {
        // Arrange
        val code = """
            int main() {
                std::string message = "Hello World";
                return 0;
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.strings).containsExactly("Hello World")
    }

    @Test
    fun `should extract raw string literal`() {
        // Arrange
        val code = """
            int main() {
                std::string message = R"(raw string content)";
                return 0;
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.strings).containsExactly("raw string content")
    }

    @Test
    fun `should extract raw string literal with delimiter`() {
        // Arrange
        val code = """
            int main() {
                std::string message = R"delim(content with )parentheses)delim";
                return 0;
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.strings).containsExactly("content with )parentheses")
    }

    @Test
    fun `should extract char literal`() {
        // Arrange
        val code = """
            int main() {
                char c = 'A';
                return 0;
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.strings).containsExactly("A")
    }
}
