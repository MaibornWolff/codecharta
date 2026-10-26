package de.maibornwolff.treesitter.excavationsite.languages.typescript

import de.maibornwolff.treesitter.excavationsite.api.AngularSelector
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
        fun `should declare the elements and pipes of the inline template of each component`() {
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
                .containsExactly(listOf("goldCoins"), emptyList())
            assertThat(
                embedded.map { template ->
                    template.declarations
                        .single()
                        .angular
                        ?.elements
                        .orEmpty()
                        .map { it.element }
                }
            ).containsExactly(listOf("app-torch"), listOf("p"))
        }

        @Test
        fun `should declare the elements of a quoted inline template behind escaped quotes`() {
            // Arrange
            val code = """
                @Component({ selector: 'app-lair', template: '<app-dragon size=\'large\'></app-dragon>' })
                export class LairComponent {}
            """.trimIndent()

            // Act
            val template = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT).embedded.single()

            // Assert
            assertThat(template.declarations.single().angular?.elements)
                .containsExactly(AngularSelector(element = "app-dragon", attributes = mapOf("size" to "large")))
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
            assertThat(angular?.selectors).isEmpty()
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
    inner class AngularPipeNames {
        @Test
        fun `should name a pipe after its pipe name`() {
            // Arrange
            val code = """
                @Pipe({ name: "goldCoins", standalone: true })
                export class GoldCoinsPipe implements PipeTransform {}
            """.trimIndent()

            // Act
            val angular = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT).declarations.single().angular

            // Assert
            assertThat(angular?.pipeName).isEqualTo("goldCoins")
        }

        @Test
        fun `should read a selector, template file and pipe name written in backticks without substitutions`() {
            // Arrange
            val code = """
                @Component({ selector: `app-vault`, templateUrl: `./vault.component.html` })
                export class VaultComponent {}
                @Pipe({ name: `goldCoins` })
                export class GoldCoinsPipe {}
                @Component({ selector: `app-${'$'}{kind}` })
                export class KindComponent {}
            """.trimIndent()

            // Act
            val declarations = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT).declarations

            // Assert
            assertThat(declarations.map { listOf(it.angular?.selectors, it.angular?.pipeName, it.angular?.templateUrl) }).containsExactly(
                listOf(listOf(AngularSelector(element = "app-vault")), null, "./vault.component.html"),
                listOf(emptyList<AngularSelector>(), "goldCoins", null),
                listOf(emptyList<AngularSelector>(), null, null)
            )
        }

        @Test
        fun `should not name classes without component, directive or pipe decorator`() {
            // Arrange
            val code = """
                @Injectable({ providedIn: 'root' })
                export class TreasuryService {}
                export class Centaur {}
            """.trimIndent()

            // Act
            val declarations = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT).declarations

            // Assert
            assertThat(declarations.mapNotNull { it.angular }).isEmpty()
        }
    }

    @Nested
    inner class AngularSelectors {
        private fun selectorsOf(code: String): List<AngularSelector> = TreeSitterDependencies
            .analyze(code, Language.TYPESCRIPT)
            .declarations
            .single()
            .angular
            ?.selectors
            .orEmpty()

        @Test
        fun `should read each alternative of a component selector with its element, attributes and classes`() {
            // Arrange
            val code = """
                @Component({ selector: 'App-Lantern[lit], [appGlow=Bright].flame.Ember' })
                export class LanternComponent {}
            """.trimIndent()

            // Act
            val selectors = selectorsOf(code)

            // Assert
            assertThat(selectors).containsExactly(
                AngularSelector(element = "app-lantern", attributes = mapOf("lit" to "")),
                AngularSelector(attributes = mapOf("appGlow" to "bright"), classNames = setOf("flame", "ember"))
            )
        }

        @Test
        fun `should read the selector of a directive with its not parts and quoted attribute values`() {
            // Arrange
            val code = """
                @Directive({ selector: 'input[type="range"]:not([disabled]):not(.locked), #torch' })
                export class RangeDirective {}
            """.trimIndent()

            // Act
            val selectors = selectorsOf(code)

            // Assert
            assertThat(selectors).containsExactly(
                AngularSelector(
                    element = "input",
                    attributes = mapOf("type" to "range"),
                    notSelectors = listOf(
                        AngularSelector(attributes = mapOf("disabled" to "")),
                        AngularSelector(classNames = setOf("locked"))
                    )
                ),
                AngularSelector(attributes = mapOf("id" to "torch"))
            )
        }

        @Test
        fun `should read a selector of only not parts as one that matches any other element`() {
            // Arrange
            val code = """
                @Directive({ selector: ':not(a)' })
                export class NotLinkDirective {}
            """.trimIndent()

            // Act
            val selectors = selectorsOf(code)

            // Assert
            assertThat(selectors).containsExactly(AngularSelector(notSelectors = listOf(AngularSelector(element = "a"))))
        }
    }
}
