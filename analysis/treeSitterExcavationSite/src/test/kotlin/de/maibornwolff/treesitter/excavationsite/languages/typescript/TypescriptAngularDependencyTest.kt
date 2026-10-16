package de.maibornwolff.treesitter.excavationsite.languages.typescript

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterDependencies
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test

class TypescriptAngularDependencyTest {
    @Nested
    inner class AngularTemplateFiles {
        @Test
        fun `should read the template file of a component as its templateUrl writes it`() {
            // Arrange
            val code = """
                @Component({ selector: 'app-cave', templateUrl: './cave.component.html' })
                export class CaveComponent {}
            """.trimIndent()

            // Act
            val angular = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT).declarations.single().angular

            // Assert
            assertThat(angular?.templateUrl).isEqualTo("./cave.component.html")
        }

        @Test
        fun `should declare the components and pipes the inline template of each component uses`() {
            // Arrange
            val code = """
                @Component({ selector: 'app-chest', template: `<app-torch />{{ gold | goldCoins }}` })
                export class ChestComponent {}
                @Component({ selector: 'app-lid', template: '<p>Lid</p>' })
                export class LidComponent {}
            """.trimIndent()

            // Act
            val embedded = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT).embedded

            // Assert
            assertThat(embedded.map { it.owner to it.language })
                .containsExactly("ChestComponent" to Language.ANGULAR, "LidComponent" to Language.ANGULAR)
            assertThat(embedded.map { template -> template.declarations.single().usedTypes.map { it.name } })
                .containsExactly(listOf("app-torch", "goldCoins"), emptyList())
        }

        @Test
        fun `should declare the components a quoted inline template uses behind escaped quotes`() {
            // Arrange
            val code = """
                @Component({ selector: 'app-lair', template: '<app-dragon size=\'large\'></app-dragon>' })
                export class LairComponent {}
            """.trimIndent()

            // Act
            val template = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT).embedded.single()

            // Assert
            assertThat(template.declarations.single().usedTypes.map { it.name }).containsExactly("app-dragon")
        }

        @Test
        fun `should declare a routed component without a selector by its template file`() {
            // Arrange
            val code = """
                @Component({ templateUrl: '../pages/lair.page.html' })
                export class LairPage {}
            """.trimIndent()

            // Act
            val angular = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT).declarations.single().angular

            // Assert
            assertThat(angular?.templateNames).isEmpty()
            assertThat(angular?.templateUrl).isEqualTo("../pages/lair.page.html")
        }
    }

    @Nested
    inner class AngularScopes {
        @Test
        fun `should read the classes a standalone component imports`() {
            // Arrange
            val code = """
                @Component({ selector: 'app-cave', imports: [TorchComponent, CommonModule, ...SHARED, forwardRef(() => Lid)] })
                export class CaveComponent {}
            """.trimIndent()

            // Act
            val angular = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT).declarations.single().angular

            // Assert
            assertThat(angular?.imports).containsExactly("TorchComponent", "CommonModule")
        }

        @Test
        fun `should read the declarations imports and exports of a module`() {
            // Arrange
            val code = """
                @NgModule({
                  declarations: [CaveComponent, TorchComponent],
                  imports: [CommonModule, LanternModule],
                  exports: [CaveComponent],
                })
                export class CellarModule {}
            """.trimIndent()

            // Act
            val angular = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT).declarations.single().angular

            // Assert
            assertThat(angular?.declarations).containsExactly("CaveComponent", "TorchComponent")
            assertThat(angular?.imports).containsExactly("CommonModule", "LanternModule")
            assertThat(angular?.exports).containsExactly("CaveComponent")
        }
    }

    @Nested
    inner class AngularTemplateNames {
        private fun templateNamesOf(code: String, className: String): Set<String> = TreeSitterDependencies
            .analyze(
                code,
                Language.TYPESCRIPT
            ).declarations
            .first { it.name == className }
            .angular
            ?.templateNames
            .orEmpty()

        @Test
        fun `should name an exported component after its element selector`() {
            // Arrange
            val code = """
                @Component({ selector: 'app-cave-map', templateUrl: './cave-map.component.html' })
                export class CaveMapComponent {}
            """.trimIndent()

            // Act
            val templateNames = templateNamesOf(code, "CaveMapComponent")

            // Assert
            assertThat(templateNames).containsExactly("app-cave-map")
        }

        @Test
        fun `should name a component after each element of a selector list but not after attribute or class selectors`() {
            // Arrange
            val code = """
                @Component({ selector: 'app-torch, App-Lantern[lit], [appGlow], .flame' })
                class TorchComponent {}
            """.trimIndent()

            // Act
            val templateNames = templateNamesOf(code, "TorchComponent")

            // Assert
            assertThat(templateNames).containsExactly("app-torch", "app-lantern")
        }

        @Test
        fun `should name a pipe after its pipe name`() {
            // Arrange
            val code = """
                @Pipe({ name: "goldCoins", standalone: true })
                export class GoldCoinsPipe implements PipeTransform {}
            """.trimIndent()

            // Act
            val templateNames = templateNamesOf(code, "GoldCoinsPipe")

            // Assert
            assertThat(templateNames).containsExactly("goldCoins")
        }

        @Test
        fun `should not name classes without component or pipe decorator`() {
            // Arrange
            val code = """
                @Injectable({ providedIn: 'root' })
                export class TreasuryService {}
                @Directive({ selector: 'app-glow' })
                export class GlowDirective {}
                export class Centaur {}
            """.trimIndent()

            // Act
            val declarations = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT).declarations

            // Assert
            assertThat(declarations.mapNotNull { it.angular }).isEmpty()
        }
    }
}
