package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.typescript

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.TSE_MODULE_SCRIPT_NAME
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileInfo
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
import de.maibornwolff.treesitter.excavationsite.api.UsedType
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import java.io.File

class ModuleScriptUsesTest {
    @TempDir
    lateinit var analysisRoot: File

    private val main by lazy { FileInfo(SupportedLanguage.TYPESCRIPT, "app/main.ts", "", analysisRoot) }

    @Test
    fun `should write a use of a module's top-level code as the path of its script leaf`() {
        // Arrange
        File(analysisRoot, "app").mkdirs()
        File(analysisRoot, "app/polyfill.ts").writeText("install()")
        val use = UsedType(name = TSE_MODULE_SCRIPT_NAME, namespacePrefix = listOf(".", "polyfill"))

        // Act
        val written = ModuleScriptUses.of(setOf(use, UsedType("Model")), main)

        // Assert
        assertThat(written.map { it.name }).containsExactlyInAnyOrder("app.polyfill.polyfill_script", "Model")
    }

    @Test
    fun `should drop a use of the top-level code of a module that is no project file`() {
        // Arrange
        val use = UsedType(name = TSE_MODULE_SCRIPT_NAME, namespacePrefix = listOf("zone.js"))

        // Act
        val written = ModuleScriptUses.of(setOf(use), main)

        // Assert
        assertThat(written).isEmpty()
    }
}
