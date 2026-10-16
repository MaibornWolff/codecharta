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
        fun `should not extract plain attribute values`() {
            // Arrange
            val code = """<section class="cave" id="entrance"></section>"""

            // Act
            val result = TreeSitterExtraction.extract(code, Language.ANGULAR)

            // Assert
            assertThat(result.strings).isEmpty()
        }
    }
}
