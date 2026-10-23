package de.maibornwolff.treesitter.excavationsite.languages.typescript

import de.maibornwolff.treesitter.excavationsite.api.DeclarationType
import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterDependencies
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class TypescriptScriptDeclarationTest {
    @Test
    fun `should report the top-level code outside every declaration as one script declaration of what it names`() {
        // Arrange
        val code = """
            import { AppModule } from './app'
            import { Router } from './router'
            export class Shell {}
            bootstrap(AppModule)
            if (debug) { new Router() }
        """.trimIndent()

        // Act
        val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

        // Assert
        val script = result.declarations.single { it.type == DeclarationType.SCRIPT }
        assertThat(script.usedTypes.map { it.name }).containsExactlyInAnyOrder("bootstrap", "AppModule", "Router", "debug")
        assertThat(script.isFileScoped).isFalse()
    }

    @Test
    fun `should report no script declaration for imports, exports, declarations, directives and CommonJS exports`() {
        // Arrange
        val code = """
            'use strict'
            import { AppModule } from './app'
            export { AppModule }
            export * from './other'
            const settings = { debug: true }
            namespace Shapes { export class Circle {} }
            declare const VERSION: string
            module.exports = settings
            exports.debug = settings.debug
        """.trimIndent()

        // Act
        val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

        // Assert
        assertThat(result.declarations).noneMatch { it.type == DeclarationType.SCRIPT }
    }

    @Test
    fun `should report a side-effect import and a require whose result is not bound as uses of the module's script`() {
        // Arrange
        val code = """
            import './polyfill'
            import { AppModule } from './app'
            require('../setup')
            export const ready = true
        """.trimIndent()

        // Act
        val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

        // Assert
        val script = result.declarations.single { it.type == DeclarationType.SCRIPT }
        assertThat(script.usedTypes.map { it.name to it.namespacePrefix }).containsExactlyInAnyOrder(
            "MODULE_SCRIPT" to listOf(".", "polyfill"),
            "MODULE_SCRIPT" to listOf("..", "setup")
        )
    }
}
