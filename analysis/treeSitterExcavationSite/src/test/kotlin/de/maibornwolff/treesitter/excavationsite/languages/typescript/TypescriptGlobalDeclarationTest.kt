package de.maibornwolff.treesitter.excavationsite.languages.typescript

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterDependencies
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class TypescriptGlobalDeclarationTest {
    private fun scopesOf(code: String): List<Pair<String, List<String>>> =
        TreeSitterDependencies.analyze(code, Language.TYPESCRIPT).declarations.filter { it.name.isNotEmpty() }.map {
            it.name to
                it.parentPath
        }

    @Test
    fun `should mark every top-level declaration of a script file global`() {
        // Arrange
        val code = """
            interface Registry { size: number }
            declare const VERSION: string
            function helper(): number { return 1 }
        """.trimIndent()

        // Act
        val scopes = scopesOf(code)

        // Assert
        assertThat(scopes).containsExactlyInAnyOrder(
            "Registry" to listOf("GLOBAL"),
            "VERSION" to listOf("GLOBAL"),
            "helper" to listOf("GLOBAL")
        )
    }

    @Test
    fun `should extract the declarations of a declare global block of a module as global ones`() {
        // Arrange
        val code = """
            export class Shell {}
            declare global {
              interface Settings { debug: boolean }
              const BUILD: string
            }
        """.trimIndent()

        // Act
        val scopes = scopesOf(code)

        // Assert
        assertThat(scopes).containsExactlyInAnyOrder(
            "Shell" to emptyList(),
            "Settings" to listOf("GLOBAL"),
            "BUILD" to listOf("GLOBAL")
        )
    }
}
