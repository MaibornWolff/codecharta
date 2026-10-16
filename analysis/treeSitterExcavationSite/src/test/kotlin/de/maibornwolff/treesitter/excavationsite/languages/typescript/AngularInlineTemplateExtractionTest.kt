package de.maibornwolff.treesitter.excavationsite.languages.typescript

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterExtraction
import de.maibornwolff.treesitter.excavationsite.shared.domain.ExtractionContext
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class AngularInlineTemplateExtractionTest {
    @Test
    fun `should extract a template key nested in the decorator as a string of the component file`() {
        // Arrange
        val code = """
            @Component({
              selector: 'app-nested',
              templateUrl: './nested.component.html',
              providers: [{ provide: 'X', useValue: { template: 'ancient sorcery incantation' } }]
            })
            class NestedComponent {}
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

        // Assert
        assertThat(result.strings)
            .containsExactly("app-nested", "./nested.component.html", "X", "ancient sorcery incantation")
        assertThat(result.extractedTexts.filter { it.language == Language.ANGULAR }).isEmpty()
    }

    @Test
    fun `should extract the strings of the decorators of exported classes`() {
        // Arrange
        val code = """
            @Component({ selector: 'app-lair', host: { title: 'Dragon lair' } })
            export class LairComponent {}
            @Injectable({ providedIn: 'root' })
            export default class HoardService {}
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

        // Assert
        assertThat(result.strings).containsExactly("app-lair", "Dragon lair", "root")
    }

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
            .containsExactly("Torch" to ExtractionContext.TEXT, "flame" to ExtractionContext.IDENTIFIER)
    }

    @Test
    fun `should extract the texts of a quoted inline template without its escapes`() {
        // Arrange
        val code = """
            @Component({ selector: 'app-esc', template: '<div title=\'Dragon hoard\'>{{ gold ? \'rich\' : \'poor\' }}\n</div>' })
            export class EscapedComponent {}
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

        // Assert
        val templateTexts = result.extractedTexts.filter { it.language == Language.ANGULAR }
        assertThat(templateTexts.map { it.text }).containsExactly("Dragon hoard", "gold", "rich", "poor")
    }
}
