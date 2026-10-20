package de.maibornwolff.treesitter.excavationsite.languages.csharp

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterExtraction
import de.maibornwolff.treesitter.excavationsite.shared.domain.ExtractionContext
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class CSharpExtractionTest {
    @Test
    fun `should correctly categorize extracted items by context`() {
        // Arrange
        val code = """
            // Comment about the class
            public class Example {
                string name = "test";
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.identifiers).containsExactly("Example", "name")
        assertThat(result.comments).containsExactly("Comment about the class")
        assertThat(result.strings).containsExactly("test")
    }

    @Test
    fun `should provide access via extractedTexts list`() {
        // Arrange
        val code = """
            // Comment
            public class Foo {}
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.extractedTexts.map { it.context }).containsExactly(
            ExtractionContext.COMMENT,
            ExtractionContext.IDENTIFIER
        )
    }

    @Test
    fun `should report extraction is supported for CSharp`() {
        // Act & Assert
        assertThat(TreeSitterExtraction.isExtractionSupported(Language.CSHARP)).isTrue()
        assertThat(TreeSitterExtraction.isExtractionSupported(".cs")).isTrue()
    }

    @Test
    fun `should return CSharp in supported languages`() {
        // Act & Assert
        assertThat(TreeSitterExtraction.isExtractionSupported(Language.CSHARP)).isTrue()
    }

    @Test
    fun `should return cs extension in supported extensions`() {
        // Act & Assert
        assertThat(TreeSitterExtraction.isExtractionSupported(".cs")).isTrue()
    }
}
