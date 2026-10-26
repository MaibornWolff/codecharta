package de.maibornwolff.treesitter.excavationsite.languages.typescript

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterDependencies
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class TypescriptDynamicImportTest {
    private fun bindingOf(code: String, specifier: String) = "dynamic_import_" + code.indexOf("import('$specifier')")

    private fun usesOf(code: String, declaration: String): List<String> = TreeSitterDependencies
        .analyze(code, Language.TYPESCRIPT)
        .declarations
        .single { it.name == declaration }
        .usedTypes
        .map { it.name }

    @Test
    fun `should report a name read from a dynamic import's result through the binding of its module`() {
        // Arrange
        val code = """
            export const routes = [
              { path: 'admin', loadComponent: () => import('./admin').then((m) => m.AdminComponent) },
              { path: 'report', loadComponent: () => import('./report').then(({ ReportComponent }) => ReportComponent) },
            ]
            export async function loadStats(): Promise<unknown> {
              return (await import('./stats')).Stats
            }
        """.trimIndent()

        // Act
        val routes = usesOf(code, "routes")
        val loadStats = usesOf(code, "loadStats")

        // Assert
        assertThat(routes).containsExactlyInAnyOrder(
            bindingOf(code, "./admin") + ".AdminComponent",
            bindingOf(code, "./report") + ".ReportComponent"
        )
        assertThat(loadStats).containsExactlyInAnyOrder("Promise", bindingOf(code, "./stats") + ".Stats")
    }

    @Test
    fun `should report a name a declarator binds to an awaited dynamic import through the binding of its module`() {
        // Arrange
        val code = """
            export async function load(): Promise<void> {
              const charts = await import('./charts')
              const { render: draw } = await import('./render')
              charts.plot(draw())
            }
        """.trimIndent()

        // Act
        val load = usesOf(code, "load")

        // Assert
        assertThat(load).containsExactlyInAnyOrder(
            "Promise",
            bindingOf(code, "./charts") + ".plot",
            bindingOf(code, "./render") + ".render"
        )
    }

    @Test
    fun `should report the name an import type reads through the binding of its module`() {
        // Arrange
        val code = """
            export class Limit {
              fastest?: import('./speed').Speed
            }
        """.trimIndent()

        // Act
        val limit = usesOf(code, "Limit")

        // Assert
        assertThat(limit).containsExactly(bindingOf(code, "./speed") + ".Speed")
    }
}
