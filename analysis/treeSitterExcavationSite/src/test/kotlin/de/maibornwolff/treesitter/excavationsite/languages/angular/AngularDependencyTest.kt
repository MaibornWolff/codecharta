package de.maibornwolff.treesitter.excavationsite.languages.angular

import de.maibornwolff.treesitter.excavationsite.api.DeclarationType
import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterDependencies
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.tuple
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test

class AngularDependencyTest {
    private fun analyze(code: String) = TreeSitterDependencies.analyze(code, Language.ANGULAR)

    private fun usedNamesOf(code: String): List<String> = analyze(code).declarations.single().usedTypes.map { it.name }

    @Nested
    inner class ApiSupportCheck {
        @Test
        fun `should report Angular templates as dependency-supported`() {
            // Arrange & Act
            val supported = TreeSitterDependencies.isDependencyAnalysisSupported(Language.ANGULAR)

            // Assert
            assertThat(supported).isTrue()
        }
    }

    @Nested
    inner class TemplateDeclaration {
        @Test
        fun `should extract one nameless script declaration without package path and imports`() {
            // Arrange
            val code = "<p>Welcome to the cellar</p>"

            // Act
            val result = analyze(code)

            // Assert
            assertThat(result.packagePath).isEmpty()
            assertThat(result.imports).isEmpty()
            assertThat(result.declarations).extracting({ it.name }, { it.type }).containsExactly(tuple("", DeclarationType.SCRIPT))
            assertThat(result.declarations.single().usedTypes).isEmpty()
        }
    }

    @Nested
    inner class UsedComponents {
        @Test
        fun `should extract the custom elements of the template once each in source order`() {
            // Arrange
            val code = """
                <section>
                  <app-cave-map [cave]="cave"></app-cave-map>
                  @if (lit) { <app-torch /> }
                  <app-cave-map />
                </section>
            """.trimIndent()

            // Act
            val usedNames = usedNamesOf(code)

            // Assert
            assertThat(usedNames).containsExactly("app-cave-map", "app-torch")
        }

        @Test
        fun `should leave out html elements and the ng elements of angular itself`() {
            // Arrange
            val code = """
                <div><ng-container *ngIf="lit"><ng-template><span>Dark</span></ng-template></ng-container></div>
                <ng-content select="footer" />
            """.trimIndent()

            // Act
            val usedNames = usedNamesOf(code)

            // Assert
            assertThat(usedNames).isEmpty()
        }

        @Test
        fun `should lowercase the element name the way html does`() {
            // Arrange
            val code = "<App-Torch></App-Torch>"

            // Act
            val usedNames = usedNamesOf(code)

            // Assert
            assertThat(usedNames).containsExactly("app-torch")
        }
    }

    @Nested
    inner class UsedPipes {
        @Test
        fun `should extract every pipe of a pipe sequence`() {
            // Arrange
            val code = """<p>{{ treasure.value | goldCoins: 2 | uppercase }}</p>"""

            // Act
            val usedNames = usedNamesOf(code)

            // Assert
            assertThat(usedNames).containsExactly("goldCoins", "uppercase")
        }

        @Test
        fun `should extract the pipes and elements of bindings and control flow blocks in source order`() {
            // Arrange
            val code = """
                @if (party$ | async; as party) {
                  <app-party-list [members]="party.members | sortByRank" />
                }
            """.trimIndent()

            // Act
            val usedNames = usedNamesOf(code)

            // Assert
            assertThat(usedNames).containsExactly("async", "app-party-list", "sortByRank")
        }
    }
}
