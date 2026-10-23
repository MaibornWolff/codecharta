package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.typescript

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.TSE_DEFAULT_EXPORT_NAME
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileInfo
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
import de.maibornwolff.treesitter.excavationsite.api.UsedType
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import java.io.File

class DefaultExportUsesTest {
    @TempDir
    lateinit var analysisRoot: File

    private val index by lazy { FileInfo(SupportedLanguage.TYPESCRIPT, "ui/index.ts", "", analysisRoot) }

    @Test
    fun `should write a use of the default export of a module by its specifier as the path of that export`() {
        // Arrange
        File(analysisRoot, "ui").mkdirs()
        File(analysisRoot, "ui/button.ts").writeText("export default class Button {}")
        val use = UsedType(name = TSE_DEFAULT_EXPORT_NAME, namespacePrefix = listOf(".", "button"))

        // Act
        val written = DefaultExportUses.of(setOf(use, UsedType("Model")), index)

        // Assert
        assertThat(written.map { it.name }).containsExactlyInAnyOrder("ui.button.Button", "Model")
    }

    @Test
    fun `should drop a use of the default export of a module that is no project file`() {
        // Arrange
        val use = UsedType(name = TSE_DEFAULT_EXPORT_NAME, namespacePrefix = listOf("react"))

        // Act
        val written = DefaultExportUses.of(setOf(use), index)

        // Assert
        assertThat(written).isEmpty()
    }
}
