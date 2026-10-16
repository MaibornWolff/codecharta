package de.maibornwolff.treesitter.excavationsite.languages.angular

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterExtraction
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test

class AngularExtractionTest {
    @Nested
    inner class Identifiers {
        @Test
        fun `should extract identifiers of interpolations including pipe names`() {
            // Arrange
            val code = """<h2>{{ cave.name | goldCoins: 2 }}</h2>"""

            // Act
            val result = TreeSitterExtraction.extract(code, Language.ANGULAR)

            // Assert
            assertThat(result.identifiers).containsExactly("cave", "name", "goldCoins")
        }

        @Test
        fun `should extract identifiers of bound expressions but not the names they are bound to`() {
            // Arrange
            val code = """<app-cave-map [cave]="selectedCave" (roomSelected)="enterRoom(room)" [(ngModel)]="explorer" />"""

            // Act
            val result = TreeSitterExtraction.extract(code, Language.ANGULAR)

            // Assert
            assertThat(result.identifiers).containsExactly("selectedCave", "enterRoom", "room", "explorer")
        }

        @Test
        fun `should not extract the parts of class style and event modifier binding names`() {
            // Arrange
            val code = """<div [class.flooded]="isFlooded" [style.width.px]="depth" (keyup.enter)="descend()"></div>"""

            // Act
            val result = TreeSitterExtraction.extract(code, Language.ANGULAR)

            // Assert
            assertThat(result.identifiers).containsExactly("isFlooded", "depth", "descend")
        }

        @Test
        fun `should extract identifiers with letters beyond ASCII`() {
            // Arrange
            val code = """<p>{{ höhle.rüstungsklasse }}</p>"""

            // Act
            val result = TreeSitterExtraction.extract(code, Language.ANGULAR)

            // Assert
            assertThat(result.identifiers).containsExactly("höhle", "rüstungsklasse")
        }

        @Test
        fun `should extract the handler of an event of a global target but not the target and the event`() {
            // Arrange
            val code = """<div (window:resize)="onResize(cellar)"></div>"""

            // Act
            val result = TreeSitterExtraction.extract(code, Language.ANGULAR)

            // Assert
            assertThat(result.identifiers).containsExactly("onResize", "cellar")
        }

        @Test
        fun `should extract identifiers of an interpolation inside a plain attribute value`() {
            // Arrange
            val code = """<i class="w-4 {{ wasPathCopied() ? 'done' : 'copy' }}"></i>"""

            // Act
            val result = TreeSitterExtraction.extract(code, Language.ANGULAR)

            // Assert
            assertThat(result.identifiers).containsExactly("wasPathCopied")
            assertThat(result.strings).containsExactly("done", "copy")
        }

        @Test
        fun `should extract identifiers of structural directives but not the directive names and keywords`() {
            // Arrange
            val code = """<li *ngFor="let centaur of centaurs; trackBy: byName" *ngIf="isLit">{{ centaur }}</li>"""

            // Act
            val result = TreeSitterExtraction.extract(code, Language.ANGULAR)

            // Assert
            assertThat(result.identifiers).containsExactly("centaur", "centaurs", "trackBy", "byName", "isLit", "centaur")
        }

        @Test
        fun `should extract identifiers of control flow blocks but not implicit variables`() {
            // Arrange
            val code = """
                @for (room of cave.rooms; track room.id; let position = ${'$'}index) {
                  <li (click)="open(${'$'}event)">{{ position }}</li>
                }
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.ANGULAR)

            // Assert
            assertThat(result.identifiers).containsExactly("room", "cave", "rooms", "room", "id", "position", "open", "position")
        }
    }

    @Nested
    inner class Comments {
        @Test
        fun `should extract html comments without their markers`() {
            // Arrange
            val code = """
                <!-- The cave overview -->
                <section></section>
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.ANGULAR)

            // Assert
            assertThat(result.comments).containsExactly("The cave overview")
        }

        @Test
        fun `should not extract comment markers inside attribute values and string literals as comments`() {
            // Arrange
            val code = """<p title="<!-- not a comment -->">{{ '<!-- not a comment either -->' }}</p>"""

            // Act
            val result = TreeSitterExtraction.extract(code, Language.ANGULAR)

            // Assert
            assertThat(result.comments).isEmpty()
        }
    }

    @Nested
    inner class Strings {
        @Test
        fun `should extract text content and string literals of expressions`() {
            // Arrange
            val code = """
                <p [title]="isLit ? 'Torch lit' : 'Darkness'">Beware of the dragon</p>
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.ANGULAR)

            // Assert
            assertThat(result.strings).containsExactly("Torch lit", "Darkness", "Beware of the dragon")
        }

        @Test
        fun `should not extract the values of attributes that hold no user-facing text`() {
            // Arrange
            val code = """
                <section class="cave" id="entrance" style="color: brown" type="button" aria-labelledby="cave-title"></section>
                <img icon="torch" src="torch.png" href="/cellar" data-testid="cave-image" />
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.ANGULAR)

            // Assert
            assertThat(result.strings).isEmpty()
        }

        @Test
        fun `should extract the values of the standard user-facing attributes`() {
            // Arrange
            val code = """
                <button title="Copy path to clipboard" aria-label="Close the cellar door" label="Descend"></button>
                <img alt="A sleeping dragon" />
                <input placeholder="Name your centaur" aria-placeholder="Centaur name" aria-description="The stable" />
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.ANGULAR)

            // Assert
            assertThat(result.strings).containsExactly(
                "Copy path to clipboard",
                "Close the cellar door",
                "Descend",
                "A sleeping dragon",
                "Name your centaur",
                "Centaur name",
                "The stable"
            )
        }

        @Test
        fun `should extract the values of attributes whose name ends like user-facing text in camel and kebab case`() {
            // Arrange
            val code = """
                <cc-button hoverHint="Reveal the lair" empty-message="No treasure here" pageTitle="Dungeon map" />
                <cc-badge tooltip="Hit points" ariaLabel="Armor class" actionText="Roll initiative" />
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.ANGULAR)

            // Assert
            assertThat(result.strings).containsExactly(
                "Reveal the lair",
                "No treasure here",
                "Dungeon map",
                "Hit points",
                "Armor class",
                "Roll initiative"
            )
        }

        @Test
        fun `should extract the text around an interpolation of a user-facing attribute without its padding`() {
            // Arrange
            val code = """<button title="Copy {{ path }} to the clipboard"></button>"""

            // Act
            val result = TreeSitterExtraction.extract(code, Language.ANGULAR)

            // Assert
            assertThat(result.strings).containsExactly("Copy", "to the clipboard")
            assertThat(result.identifiers).containsExactly("path")
        }

        @Test
        fun `should extract an unquoted user-facing attribute value`() {
            // Arrange
            val code = """<img alt=Dragon />"""

            // Act
            val result = TreeSitterExtraction.extract(code, Language.ANGULAR)

            // Assert
            assertThat(result.strings).containsExactly("Dragon")
        }

        @Test
        fun `should not extract i18n markers and attributes with an Angular binding prefix`() {
            // Arrange
            val code = """
                <button i18n-title title="Open the vault" bind-title="vaultTitle" bindLabel="name"></button>
                <ng-template let-label="label"><p>{{ label }}</p></ng-template>
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.ANGULAR)

            // Assert
            assertThat(result.strings).containsExactly("Open the vault")
        }
    }
}
