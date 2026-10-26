package de.maibornwolff.treesitter.excavationsite.languages.angular

import de.maibornwolff.treesitter.excavationsite.api.AngularSelector
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
            val code = "Welcome to the cellar"

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
        fun `should extract the elements of the template once each in source order`() {
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
            assertThat(usedNames).containsExactly("section", "app-cave-map", "app-torch")
        }

        @Test
        fun `should extract an element without a hyphen, as a component selector needs none`() {
            // Arrange
            val code = "<creature [kind]=\"'centaur'\"></creature>"

            // Act
            val usedNames = usedNamesOf(code)

            // Assert
            assertThat(usedNames).containsExactly("creature")
        }

        @Test
        fun `should leave out the ng elements of angular itself`() {
            // Arrange
            val code = """
                <div><ng-container *ngIf="lit"><ng-template><span>Dark</span></ng-template></ng-container></div>
                <ng-content select="footer" />
            """.trimIndent()

            // Act
            val usedNames = usedNamesOf(code)

            // Assert
            assertThat(usedNames).containsExactly("div", "span")
        }

        @Test
        fun `should keep a component whose selector starts with ng like those of Angular itself`() {
            // Arrange
            val code = """<ng-select [items]="dragons"></ng-select><ng-container><ngx-charts-bar /></ng-container>"""

            // Act
            val usedNames = usedNamesOf(code)

            // Assert
            assertThat(usedNames).containsExactly("ng-select", "ngx-charts-bar")
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
            assertThat(usedNames).containsExactly("p", "goldCoins", "uppercase")
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

    @Nested
    inner class TemplateElements {
        private fun elementsOf(code: String): List<AngularSelector> = analyze(code)
            .declarations
            .single()
            .angular
            ?.elements
            .orEmpty()

        @Test
        fun `should report each element once with its tag, its attributes and their lower-case values, and its classes`() {
            // Arrange
            val code = """
                <section class="Cave  dark" appGlow role="Region">
                  <app-torch lit />
                  <app-torch lit />
                </section>
            """.trimIndent()

            // Act
            val elements = elementsOf(code)

            // Assert
            assertThat(elements).containsExactly(
                AngularSelector(
                    element = "section",
                    attributes = mapOf("class" to "cave  dark", "appGlow" to "", "role" to "region"),
                    classNames = setOf("cave", "dark")
                ),
                AngularSelector(element = "app-torch", attributes = mapOf("lit" to ""))
            )
        }

        @Test
        fun `should drop the namespace of an element and an attribute as Angular does`() {
            // Arrange
            val code = "<svg:rect xlink:href=\"#cave\"></svg:rect>"

            // Act
            val elements = elementsOf(code)

            // Assert
            assertThat(elements).containsExactly(AngularSelector(element = "rect", attributes = mapOf("href" to "#cave")))
        }

        @Test
        fun `should leave out references, template variables, i18n markers and animation triggers`() {
            // Arrange
            val code = "<ng-template #map ref-legend let-cave i18n i18n-title @fade title=\"Map\"></ng-template>"

            // Act
            val elements = elementsOf(code)

            // Assert
            assertThat(elements).containsExactly(AngularSelector(element = "ng-template", attributes = mapOf("title" to "map")))
        }

        @Test
        fun `should report property, two-way and event bindings by name, a two-way one also with its change event`() {
            // Arrange
            val code = """<input [appGlow]="lit" [(appLevel)]="level" (appLit)="light()" (window:resize)="fit()" />"""

            // Act
            val elements = elementsOf(code)

            // Assert
            assertThat(elements.single().attributes).containsOnlyKeys("appGlow", "appLevel", "appLevelChange", "appLit", "resize")
        }

        @Test
        fun `should report bindings written with a prefix like those written with brackets`() {
            // Arrange
            val code = """<input bind-appGlow="lit" bindon-appLevel="level" on-appLit="light()" />"""

            // Act
            val elements = elementsOf(code)

            // Assert
            assertThat(elements.single().attributes).containsOnlyKeys("appGlow", "appLevel", "appLevelChange", "appLit")
        }

        @Test
        fun `should leave out attribute, class, style and animation bindings`() {
            // Arrange
            val code = """<div [attr.role]="r" [class.lit]="l" [style.width.px]="w" [@fade]="f"></div>"""

            // Act
            val elements = elementsOf(code)

            // Assert
            assertThat(elements).containsExactly(AngularSelector(element = "div"))
        }

        @Test
        fun `should report a structural directive as an ng-template with the directive and its microsyntax keys`() {
            // Arrange
            val code = """<li *appRepeat="let cave of caves; trackBy: byDepth; index as i; let odd = odd" class="cave"></li>"""

            // Act
            val elements = elementsOf(code)

            // Assert
            assertThat(elements).containsExactly(
                AngularSelector(
                    element = "ng-template",
                    attributes = mapOf("appRepeat" to "", "appRepeatOf" to "", "appRepeatTrackBy" to "")
                ),
                AngularSelector(element = "li", attributes = mapOf("class" to "cave"), classNames = setOf("cave"))
            )
        }

        @Test
        fun `should read the keys of a microsyntax that starts with an expression`() {
            // Arrange
            val code = """<p *appShow="lit; else dark"></p><p *appOutlet="map; context: cave"></p><p *appTorch></p>"""

            // Act
            val templates = elementsOf(code).filter { it.element == "ng-template" }

            // Assert
            assertThat(templates.map { it.attributes.keys }).containsExactly(
                setOf("appShow", "appShowElse"),
                setOf("appOutlet", "appOutletContext"),
                setOf("appTorch")
            )
        }
    }
}
