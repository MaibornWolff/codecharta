package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.typescript

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import java.io.File

class ModuleFilesTest {
    private fun File.withFiles(vararg paths: String): File {
        paths.forEach { path -> resolve(path).also { it.parentFile.mkdirs() }.writeText("") }
        return this
    }

    @Test
    fun `should find the file a path names with its ending`(
        @TempDir root: File
    ) {
        // Arrange
        root.withFiles("src/user.service.ts")

        // Act
        val file = ModuleFiles.fileAt(root.resolve("src/user.service"))

        // Assert
        assertThat(file).isEqualTo(root.resolve("src/user.service.ts"))
    }

    @Test
    fun `should try the endings in the order of the compiler`(
        @TempDir root: File
    ) {
        // Arrange
        root.withFiles("widget.d.ts", "widget.tsx", "widget.js")

        // Act
        val file = ModuleFiles.fileAt(root.resolve("widget"))

        // Assert
        assertThat(file).isEqualTo(root.resolve("widget.tsx"))
    }

    @Test
    fun `should find the TypeScript file of a path written with a JavaScript ending`(
        @TempDir root: File
    ) {
        // Arrange
        root.withFiles("a.ts", "b.js")

        // Act
        val typescript = ModuleFiles.fileAt(root.resolve("a.js"))
        val javascript = ModuleFiles.fileAt(root.resolve("b.js"))

        // Assert
        assertThat(typescript).isEqualTo(root.resolve("a.ts"))
        assertThat(javascript).isEqualTo(root.resolve("b.js"))
    }

    @Test
    fun `should find a Vue file written with its ending`(
        @TempDir root: File
    ) {
        // Arrange
        root.withFiles("Button.vue")

        // Act
        val file = ModuleFiles.fileAt(root.resolve("Button.vue"))

        // Assert
        assertThat(file).isEqualTo(root.resolve("Button.vue"))
    }

    @Test
    fun `should find a file before a folder of the same name`(
        @TempDir root: File
    ) {
        // Arrange
        root.withFiles("models.ts", "models/index.ts")

        // Act
        val file = ModuleFiles.fileAt(root.resolve("models"))

        // Assert
        assertThat(file).isEqualTo(root.resolve("models.ts"))
    }

    @Test
    fun `should find the index of a folder`(
        @TempDir root: File
    ) {
        // Arrange
        root.withFiles("models/index.tsx")

        // Act
        val file = ModuleFiles.fileAt(root.resolve("models"))

        // Assert
        assertThat(file).isEqualTo(root.resolve("models/index.tsx"))
    }

    @Test
    fun `should find the file the package json of a folder names before its index`(
        @TempDir root: File
    ) {
        // Arrange
        root.withFiles("chart/index.ts", "chart/lib/chart.d.ts")
        root.resolve("chart/package.json").writeText("""{ "name": "chart", "types": "lib/chart.d.ts", "main": "index.js" }""")

        // Act
        val file = ModuleFiles.fileAt(root.resolve("chart"))

        // Assert
        assertThat(file).isEqualTo(root.resolve("chart/lib/chart.d.ts"))
    }

    @Test
    fun `should find the entry of a package json written without its ending`(
        @TempDir root: File
    ) {
        // Arrange
        root.withFiles("core/src/main.ts")
        root.resolve("core/package.json").writeText("""{ "main": "src/main" }""")

        // Act
        val file = ModuleFiles.fileAt(root.resolve("core"))

        // Assert
        assertThat(file).isEqualTo(root.resolve("core/src/main.ts"))
    }

    @Test
    fun `should find no file for a path that names none`(
        @TempDir root: File
    ) {
        // Arrange
        root.withFiles("styles.css", "other/missing.ts")

        // Act
        val stylesheet = ModuleFiles.fileAt(root.resolve("styles.css"))
        val missing = ModuleFiles.fileAt(root.resolve("missing"))

        // Assert
        assertThat(stylesheet).isNull()
        assertThat(missing).isNull()
    }
}
