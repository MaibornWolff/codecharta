package de.maibornwolff.treesitter.excavationsite.languages.c

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterExtraction
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class CCommentAndStringExtractionTest {
    @Test
    fun `should extract single line comment`() {
        // Arrange
        val code = """
            // This is a comment
            int x;
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

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
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.comments).hasSize(1)
        assertThat(result.comments[0]).isEqualTo("This is a block comment")
    }

    @Test
    fun `should extract multiline block comment`() {
        // Arrange
        val code = """
            /*
             * This is a multiline
             * block comment
             */
            int x;
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.comments).hasSize(1)
        assertThat(result.comments[0]).isEqualTo("This is a multiline\nblock comment")
    }

    @Test
    fun `should extract doc comment`() {
        // Arrange
        val code = """
            /**
             * Calculate the total price.
             * @param count Number of items
             * @param price Price per item
             */
            int calculate(int count, int price) {
                return count * price;
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.comments).hasSize(1)
        assertThat(result.comments[0]).isEqualTo("Calculate the total price.\n@param count Number of items\n@param price Price per item")
    }

    @Test
    fun `should extract string literal`() {
        // Arrange
        val code = """
            int main() {
                char* message = "Hello World";
                return 0;
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.strings).containsExactly("Hello World")
    }

    @Test
    fun `should extract multiple strings`() {
        // Arrange
        val code = """
            int main() {
                char* first = "Hello";
                char* second = "World";
                return 0;
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.strings).containsExactly("Hello", "World")
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
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.strings).containsExactly("A")
    }

    @Test
    fun `should extract empty comment`() {
        // Arrange
        val code = """
            /**/
            int x;
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly("x")
        assertThat(result.comments).containsExactly("")
    }

    @Test
    fun `should extract comment with only whitespace`() {
        // Arrange
        val code = """
            /*   */
            int x;
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly("x")
        assertThat(result.comments).containsExactly("")
    }

    @Test
    fun `should handle comment with special characters`() {
        // Arrange
        val code = """
            // Special chars: @#$%^&*()!
            int x;
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.comments).containsExactly("Special chars: @#\$%^&*()!")
    }

    @Test
    fun `should extract empty string`() {
        // Arrange
        val code = """
            char* empty = "";
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.strings).containsExactly("")
    }

    @Test
    fun `should extract string with escape sequences`() {
        // Arrange
        val code = """
            char* escaped = "line1\nline2\ttab";
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.strings).containsExactly("line1\\nline2\\ttab")
    }

    @Test
    fun `should extract adjacent string literals`() {
        // Arrange
        val code = """
            char* msg = "Hello" " " "World";
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.strings).containsExactly("Hello", " ", "World")
    }
}
