package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.typescript

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileInfo
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
import de.maibornwolff.treesitter.excavationsite.api.ImportDeclaration
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import java.io.File

class ImportedModulesTest {
    private fun File.withFile(path: String, content: String): File = resolve(path).also {
        it.parentFile.mkdirs()
        it.writeText(content)
    }

    @Test
    fun `should find the file a relative specifier names`(
        @TempDir root: File
    ) {
        // Arrange
        val creature = root.withFile("model/creature.ts", "export class Creature {}")
        val fileInfo = FileInfo(SupportedLanguage.TYPESCRIPT, "app/main.ts", "", root)

        // Act
        val found = ImportedModules.fileOf(ImportDeclaration(path = listOf("..", "model", "creature"), isWildcard = true), fileInfo)

        // Assert
        assertThat(found?.canonicalFile).isEqualTo(creature.canonicalFile)
    }

    @Test
    fun `should look the file of a path up on disk once`(
        @TempDir root: File
    ) {
        // Arrange
        val creature = root.withFile("model/creature.ts", "export class Creature {}")
        val fileInfo = FileInfo(SupportedLanguage.TYPESCRIPT, "app/main.ts", "", root)
        val import = ImportDeclaration(path = listOf("..", "model", "creature"), isWildcard = true)
        ImportedModules.fileOf(import, fileInfo)
        creature.delete()

        // Act
        val found = ImportedModules.fileOf(import, fileInfo)

        // Assert
        assertThat(found?.name).isEqualTo("creature.ts")
    }
}
