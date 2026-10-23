package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.typescript

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import java.io.File

class GlobalDeclarationsTest {
    private fun File.withFile(path: String, content: String): File = resolve(path).also {
        it.parentFile.mkdirs()
        it.writeText(content)
    }

    @Test
    fun `should find each global of a name, of script files and of declare global blocks, none of a module`(
        @TempDir root: File
    ) {
        // Arrange
        root.withFile("types/a.d.ts", "interface Registry { a: number }")
        root.withFile("types/b.d.ts", "interface Registry { b: number }")
        root.withFile("setup.ts", "export {}\ndeclare global { interface Settings { debug: boolean } }")
        root.withFile("registry.ts", "export class Registry {}")
        root.withFile("node_modules/lib/index.d.ts", "interface Settings {}")

        // Act
        val globals = GlobalDeclarations.of(root)

        // Assert
        assertThat(globals.pathsOf("Registry")).containsExactly(
            Path(listOf("types", "a.d", "Registry")),
            Path(listOf("types", "b.d", "Registry"))
        )
        assertThat(globals.pathsOf("Settings")).containsExactly(Path(listOf("setup", "Settings")))
        assertThat(globals.pathsOf("Shell")).isEmpty()
    }
}
