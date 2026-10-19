package de.maibornwolff.codecharta.analysers.tools.gate.config

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class AcceptedDependencyReaderTest {
    private val reader = ConfigReader(FakeAnalyserCatalog(emptyMap()))

    @Test
    fun `should read the accepted cycles and upward dependencies with their reasons`() {
        // Arrange
        val text =
            """
            dependencies:
              cyclesBetweenFiles:
                severity: error
                accept:
                  - files:
                      - src/Tree.ts
                      - src/tree.html
                    reason: The tree renders its next level with itself.
              cyclesInsideFiles:
                severity: warning
                accept:
                  - files: src/Parser.kt
                    reason: The parser is recursive descent.
              upward:
                severity: warning
                accept:
                  - from: src/model/Node.kt
                    to: src/model/MutableNode.kt
                    reason: A node converts itself to its mutable twin.
            """.trimIndent()

        // Act
        val result = reader.read(text)

        // Assert
        assertThat(result.problems).isEmpty()
        assertThat(result.config.dependencies).isEqualTo(
            DependencyRules(
                cyclesBetweenFiles = DependencyRule(
                    Severity.ERROR,
                    accept = listOf(
                        AcceptedDependency(listOf("src/Tree.ts", "src/tree.html"), "The tree renders its next level with itself.")
                    )
                ),
                cyclesInsideFiles = DependencyRule(
                    Severity.WARNING,
                    accept = listOf(AcceptedDependency(listOf("src/Parser.kt"), "The parser is recursive descent."))
                ),
                upward = DependencyRule(
                    Severity.WARNING,
                    accept = listOf(
                        AcceptedDependency(
                            listOf("src/model/Node.kt", "src/model/MutableNode.kt"),
                            "A node converts itself to its mutable twin."
                        )
                    )
                )
            )
        )
    }

    @Test
    fun `should report an accepted cycle without a reason or without files`() {
        // Arrange
        val text =
            """
            dependencies:
              cyclesBetweenFiles:
                severity: error
                accept:
                  - files: [src/a.kt, src/b.kt]
                  - reason: Nobody knows which files.
            """.trimIndent()

        // Act
        val result = reader.read(text)

        // Assert
        assertThat(result.problems).containsExactly(
            ConfigProblem(5, "dependencies.cyclesBetweenFiles.accept[0] needs a reason why the dependency is accepted"),
            ConfigProblem(6, "dependencies.cyclesBetweenFiles.accept[1] needs files")
        )
        assertThat(result.config.dependencies.cyclesBetweenFiles?.accept).isEmpty()
    }

    @Test
    fun `should report an accepted file given as a pattern instead of an exact path`() {
        // Arrange
        val text =
            """
            dependencies:
              cyclesBetweenFiles:
                severity: error
                accept:
                  - files: [src/*.kt, src/b.kt]
                    reason: Too broad.
            """.trimIndent()

        // Act
        val result = reader.read(text)

        // Assert
        assertThat(result.problems).containsExactly(
            ConfigProblem(
                5,
                "dependencies.cyclesBetweenFiles.accept[0].files[0] must be the exact path of a file, found the pattern 'src/*.kt'"
            )
        )
    }

    @Test
    fun `should report an accepted cycle whose number of files does not fit its rule`() {
        // Arrange
        val text =
            """
            dependencies:
              cyclesBetweenFiles:
                severity: error
                accept:
                  - files: [src/a.kt, src/a.kt]
                    reason: One file twice.
              cyclesInsideFiles:
                severity: warning
                accept:
                  - files: [src/a.kt, src/b.kt]
                    reason: Two files.
            """.trimIndent()

        // Act
        val result = reader.read(text)

        // Assert
        assertThat(result.problems).containsExactly(
            ConfigProblem(5, "dependencies.cyclesBetweenFiles.accept[0].files must name at least two different files"),
            ConfigProblem(10, "dependencies.cyclesInsideFiles.accept[0].files must name exactly one file")
        )
    }

    @Test
    fun `should report an accepted upward dependency without its target and keys of the other shape`() {
        // Arrange
        val text =
            """
            dependencies:
              upward:
                severity: warning
                accept:
                  - from: src/a.kt
                    files: [src/b.kt]
                    reason: Half given.
            """.trimIndent()

        // Act
        val result = reader.read(text)

        // Assert
        assertThat(result.problems).containsExactly(
            ConfigProblem(5, "dependencies.upward.accept[0] needs from and to"),
            ConfigProblem(6, "unknown key 'files' in dependencies.upward.accept[0], expected one of: from, to, reason")
        )
    }
}
