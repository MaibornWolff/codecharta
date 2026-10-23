package de.maibornwolff.treesitter.excavationsite.languages.javascript

import de.maibornwolff.treesitter.excavationsite.api.DeclarationType
import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterDependencies
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class JavascriptCommonJsDefaultExportTest {
    private val defaultExport = "DEFAULT_EXPORT"

    private fun defaultExportOf(code: String, language: Language = Language.JAVASCRIPT) = TreeSitterDependencies
        .analyze(code, language)
        .declarations
        .filter { it.name == defaultExport }
        .map { it.type to it.usedTypes.map { use -> use.name } }

    @Test
    fun `should make module exports of a name the default export naming that declaration`() {
        // Arrange
        val code = "class Svc {}\nmodule.exports = Svc"

        // Act
        val defaults = defaultExportOf(code)

        // Assert
        assertThat(defaults).containsExactly(DeclarationType.REEXPORT to listOf("Svc"))
    }

    @Test
    fun `should make module exports of an anonymous function an anonymous default export`() {
        // Arrange
        val code = "const { Model } = require('./model')\nmodule.exports = function () { return new Model() }"

        // Act
        val defaults = defaultExportOf(code)

        // Assert
        assertThat(defaults.map { it.first }).containsExactly(DeclarationType.FUNCTION)
    }

    @Test
    fun `should make module exports of an object literal no default export`() {
        // Arrange
        val code = "class Svc {}\nfunction helper() {}\nmodule.exports = { Svc, helper }"

        // Act
        val defaults = defaultExportOf(code)

        // Assert
        assertThat(defaults).isEmpty()
    }

    @Test
    fun `should make a TypeScript export assignment the default export`() {
        // Arrange
        val code = "class Svc {}\nexport = Svc"

        // Act
        val defaults = defaultExportOf(code, Language.TYPESCRIPT)

        // Assert
        assertThat(defaults).containsExactly(DeclarationType.REEXPORT to listOf("Svc"))
    }
}
