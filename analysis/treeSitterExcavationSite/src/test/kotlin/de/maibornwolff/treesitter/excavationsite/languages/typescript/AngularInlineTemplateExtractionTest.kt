package de.maibornwolff.treesitter.excavationsite.languages.typescript

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterExtraction
import de.maibornwolff.treesitter.excavationsite.shared.domain.ExtractionContext
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class AngularInlineTemplateExtractionTest {
    @Test
    fun `should not extract an inline template as a string of the component file`() {
        // Arrange
        val code = """
            @Component({ selector: 'app-torch', template: `<p>Flame</p>` })
            class TorchComponent {}
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

        // Assert
        assertThat(result.extractedTexts.filter { it.language == null }.map { it.text }).doesNotContain("<p>Flame</p>")
        assertThat(result.extractedTexts.filter { it.language == Language.ANGULAR }.map { it.text }).containsExactly("Flame")
    }

    @Test
    fun `should extract the texts of an inline template marked with the Angular language`() {
        // Arrange
        val code = """
            @Component({ selector: 'app-torch', template: `<p title="Torch">{{ flame }}</p>` })
            export class TorchComponent {}
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

        // Assert
        val templateTexts = result.extractedTexts.filter { it.language == Language.ANGULAR }
        assertThat(templateTexts.map { it.text to it.context })
            .containsExactly("Torch" to ExtractionContext.STRING, "flame" to ExtractionContext.IDENTIFIER)
    }
}
