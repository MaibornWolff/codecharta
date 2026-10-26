package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.typescript.TypescriptAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileInfo
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
import de.maibornwolff.treesitter.excavationsite.api.AngularSelector
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class TypescriptAngularAnalyzerTest {
    @Test
    fun `should carry the selector of an Angular component as its template name`() {
        // Arrange
        val typescriptCode = """
            @Component({ selector: 'app-torch', templateUrl: './torch.component.html' })
            export class TorchComponent {}
        """.trimIndent()

        // Act
        val report = TypescriptAnalyzer(FileInfo(SupportedLanguage.TYPESCRIPT, "torch.component.ts", typescriptCode)).analyze()

        // Assert
        assertThat(
            report.nodes
                .single()
                .angular
                ?.declaration
                ?.templateNames
        ).containsExactly("app-torch")
    }

    @Test
    fun `should carry the template file and the imports of an Angular component`() {
        // Arrange
        val typescriptCode = """
            @Component({ selector: 'app-torch', templateUrl: '../views/torch.component.html', imports: [FlameComponent] })
            export class TorchComponent {}
        """.trimIndent()

        // Act
        val report = TypescriptAnalyzer(FileInfo(SupportedLanguage.TYPESCRIPT, "app/ui/torch.component.ts", typescriptCode)).analyze()

        // Assert
        val angular = report.nodes.single().angular
        assertThat(angular?.templatePath).isEqualTo(Path(listOf("app", "views", "torch_component_html")))
        assertThat(angular?.declaration?.imports).containsExactly("FlameComponent")
    }

    @Test
    fun `should add the inline template of an Angular component as a template node of the component file`() {
        // Arrange
        val typescriptCode = """
            @Component({ selector: 'app-torch', template: `{{ heat | celsius }}` })
            export class TorchComponent {}
        """.trimIndent()

        // Act
        val report = TypescriptAnalyzer(FileInfo(SupportedLanguage.TYPESCRIPT, "torch.component.ts", typescriptCode)).analyze()

        // Assert
        val template = report.nodes.single { it.language == SupportedLanguage.ANGULAR }
        assertThat(template.pathWithName).isEqualTo(Path(listOf("torch_component", "TorchComponent", "template")))
        assertThat(template.physicalPath).isEqualTo("torch.component.ts")
        assertThat(template.usedTypes.map { it.name }).containsExactly("celsius")
        assertThat(
            report.nodes.single { it.language == SupportedLanguage.TYPESCRIPT }.angular?.templatePath
        ).isEqualTo(template.pathWithName)
    }

    @Test
    fun `should give each of two components in one file a template node with only the names of its own template`() {
        // Arrange
        val typescriptCode = """
            @Component({ selector: 'app-torch', template: `{{ heat | celsius }}` })
            export class TorchComponent {}
            @Component({ selector: 'app-lantern', template: `<app-wick />{{ oil | litres }}` })
            export class LanternComponent {}
        """.trimIndent()

        // Act
        val report = TypescriptAnalyzer(FileInfo(SupportedLanguage.TYPESCRIPT, "light.component.ts", typescriptCode)).analyze()

        // Assert
        val usedNamesByTemplate = report.nodes
            .filter { it.language == SupportedLanguage.ANGULAR }
            .associate { template -> template.pathWithName.parts[1] to template.usedTypes.map { it.name } }
        assertThat(usedNamesByTemplate).isEqualTo(
            mapOf("TorchComponent" to listOf("celsius"), "LanternComponent" to listOf("litres"))
        )
    }

    @Test
    fun `should carry the elements of an inline template for matching selectors`() {
        // Arrange
        val typescriptCode = """
            @Component({ selector: 'app-torch', template: `<p appGlow>lit</p>` })
            export class TorchComponent {}
        """.trimIndent()

        // Act
        val report = TypescriptAnalyzer(FileInfo(SupportedLanguage.TYPESCRIPT, "torch.component.ts", typescriptCode)).analyze()

        // Assert
        val template = report.nodes.single { it.language == SupportedLanguage.ANGULAR }
        assertThat(template.angular?.declaration?.elements)
            .containsExactly(AngularSelector(element = "p", attributes = mapOf("appGlow" to "")))
    }
}
