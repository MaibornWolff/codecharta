package de.maibornwolff.treesitter.excavationsite.languages.angular

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterMetrics
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test

class AngularMetricsTest {
    @Nested
    inner class ControlFlowBlocks {
        @Test
        fun `should count if and else if blocks but not else for logic complexity`() {
            // Arrange
            val code = """
                @if (party.size > 3) {
                  <p>Too crowded</p>
                } @else if (party.size === 0) {
                  <p>Empty</p>
                } @else {
                  <p>Fine</p>
                }
            """.trimIndent()

            // Act
            val result = TreeSitterMetrics.parse(code, Language.ANGULAR)

            // Assert
            assertThat(result.logicComplexity).isEqualTo(2.0)
        }

        @Test
        fun `should count for block but not its empty block for logic complexity`() {
            // Arrange
            val code = """
                @for (room of cave.rooms; track room.id) {
                  <li>{{ room.name }}</li>
                } @empty {
                  <li>No rooms</li>
                }
            """.trimIndent()

            // Act
            val result = TreeSitterMetrics.parse(code, Language.ANGULAR)

            // Assert
            assertThat(result.logicComplexity).isEqualTo(1.0)
        }

        @Test
        fun `should count each switch case but not the default for logic complexity`() {
            // Arrange
            val code = """
                @switch (cave.danger) {
                  @case ('dragon') { <app-dragon /> }
                  @case ('troll') @case ('ogre') { <span>Brute</span> }
                  @default { <span>Calm</span> }
                }
            """.trimIndent()

            // Act
            val result = TreeSitterMetrics.parse(code, Language.ANGULAR)

            // Assert
            assertThat(result.logicComplexity).isEqualTo(3.0)
        }

        @Test
        fun `should count defer block but not its placeholder for logic complexity`() {
            // Arrange
            val code = """
                @defer (on viewport) {
                  <app-treasure-chest />
                } @placeholder {
                  <p>Loading</p>
                }
            """.trimIndent()

            // Act
            val result = TreeSitterMetrics.parse(code, Language.ANGULAR)

            // Assert
            assertThat(result.logicComplexity).isEqualTo(1.0)
        }
    }

    @Nested
    inner class StructuralDirectives {
        @Test
        fun `should count ngIf ngFor and ngSwitchCase but not ngSwitchDefault for logic complexity`() {
            // Arrange
            val code = """
                <div *ngIf="cave.hasExit; else noExit">Exit</div>
                <li *ngFor="let centaur of centaurs">{{ centaur.name }}</li>
                <div [ngSwitch]="mood">
                  <span *ngSwitchCase="'grim'">Grim</span>
                  <span *ngSwitchDefault>Fine</span>
                </div>
            """.trimIndent()

            // Act
            val result = TreeSitterMetrics.parse(code, Language.ANGULAR)

            // Assert
            assertThat(result.logicComplexity).isEqualTo(3.0)
        }

        @Test
        fun `should count ngIf and ngForOf bound on an ng-template for logic complexity`() {
            // Arrange
            val code = """
                <ng-template [ngIf]="ready" [ngIfElse]="wait"><p>Ready</p></ng-template>
                <ng-template ngFor [ngForOf]="rooms" let-room><p>{{ room }}</p></ng-template>
            """.trimIndent()

            // Act
            val result = TreeSitterMetrics.parse(code, Language.ANGULAR)

            // Assert
            assertThat(result.logicComplexity).isEqualTo(2.0)
        }

        @Test
        fun `should not count other directives and bindings for logic complexity`() {
            // Arrange
            val code = """
                <input [(ngModel)]="explorer.name" [ngClass]="mood" *appTooltip="hint" />
            """.trimIndent()

            // Act
            val result = TreeSitterMetrics.parse(code, Language.ANGULAR)

            // Assert
            assertThat(result.logicComplexity).isEqualTo(0.0)
        }
    }

    @Nested
    inner class Expressions {
        @Test
        fun `should count logical and or operators in bindings and handlers for logic complexity`() {
            // Arrange
            val code = """
                <section [class.flooded]="cave.isFlooded && !cave.drained"
                         (click)="isOpen || open()">
                </section>
            """.trimIndent()

            // Act
            val result = TreeSitterMetrics.parse(code, Language.ANGULAR)

            // Assert
            assertThat(result.logicComplexity).isEqualTo(2.0)
        }

        @Test
        fun `should count nested ternaries and nullish coalescing in interpolations for logic complexity`() {
            // Arrange
            val code = """
                <span>{{ lit ? (warm ? 'glow' : 'flame') : 'dark' }}</span>
                <span>{{ cave.depth ?? 0 }}</span>
            """.trimIndent()

            // Act
            val result = TreeSitterMetrics.parse(code, Language.ANGULAR)

            // Assert
            assertThat(result.logicComplexity).isEqualTo(3.0)
        }

        @Test
        fun `should not count arithmetic and comparison operators for logic complexity`() {
            // Arrange
            val code = """
                <span>{{ gold + silver * 2 }}</span>
                <span [hidden]="depth > 3"></span>
            """.trimIndent()

            // Act
            val result = TreeSitterMetrics.parse(code, Language.ANGULAR)

            // Assert
            assertThat(result.logicComplexity).isEqualTo(0.0)
        }
    }

    @Nested
    inner class FileMetrics {
        @Test
        fun `should report complexity equal to logic complexity since a template has no functions`() {
            // Arrange
            val code = """
                @if (lit) {
                  <p>{{ name }}</p>
                }
            """.trimIndent()

            // Act
            val result = TreeSitterMetrics.parse(code, Language.ANGULAR)

            // Assert
            assertThat(result.complexity).isEqualTo(1.0)
            assertThat(result.numberOfFunctions).isEqualTo(0.0)
        }

        @Test
        fun `should count each line of single and multi-line html comments`() {
            // Arrange
            val code = """
                <!-- The cave overview -->
                <section>
                  <!--
                    Torches light the way
                  -->
                  <p>Cave</p>
                </section>
            """.trimIndent()

            // Act
            val result = TreeSitterMetrics.parse(code, Language.ANGULAR)

            // Assert
            assertThat(result.commentLines).isEqualTo(4.0)
        }

        @Test
        fun `should not count comment markers inside attribute values and string literals as comment lines`() {
            // Arrange
            val code = """
                <p title="<!-- not a comment -->">{{ '<!-- not a comment either -->' }}</p>
                <!-- a comment -->
            """.trimIndent()

            // Act
            val result = TreeSitterMetrics.parse(code, Language.ANGULAR)

            // Assert
            assertThat(result.commentLines).isEqualTo(1.0)
        }

        @Test
        fun `should count real lines of code without comments and blank lines`() {
            // Arrange
            val code = """
                <!-- The cave overview -->
                <section>

                  <p>{{ cave.name }}</p>
                </section>
            """.trimIndent()

            // Act
            val result = TreeSitterMetrics.parse(code, Language.ANGULAR)

            // Assert
            assertThat(result.linesOfCode).isEqualTo(5.0)
            assertThat(result.realLinesOfCode).isEqualTo(3.0)
        }

        @Test
        fun `should parse a plain html document`() {
            // Arrange
            val code = """
                <!DOCTYPE html>
                <html>
                  <head><title>Cellars</title></head>
                  <body><p>Welcome</p></body>
                </html>
            """.trimIndent()

            // Act
            val result = TreeSitterMetrics.parse(code, Language.ANGULAR)

            // Assert
            assertThat(result.realLinesOfCode).isEqualTo(5.0)
            assertThat(result.logicComplexity).isEqualTo(0.0)
        }
    }
}
