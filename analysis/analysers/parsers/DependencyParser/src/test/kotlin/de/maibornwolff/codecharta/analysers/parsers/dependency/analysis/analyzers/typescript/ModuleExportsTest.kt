package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.typescript

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import java.io.File

class ModuleExportsTest {
    private fun File.withFile(path: String, content: String): File = resolve(path).also {
        it.parentFile.mkdirs()
        it.writeText(content)
    }

    @Test
    fun `should name the default export by the declaration it names`(
        @TempDir root: File
    ) {
        // Arrange
        val named = root.withFile("base.ts", "export default class Base {}")
        val identifier = root.withFile("settings.js", "const settings = {}\nexport default settings")

        // Act
        val exports = ModuleExports.of(root)

        // Assert
        assertThat(exports.defaultNameOf(named)).isEqualTo("Base")
        assertThat(exports.defaultNameOf(identifier)).isEqualTo("settings")
    }

    @Test
    fun `should name an anonymous default export default`(
        @TempDir root: File
    ) {
        // Arrange
        val anonymous = root.withFile("anon.ts", "export default function (): number { return 1 }")
        val imported = root.withFile("again.ts", "import Base from './base'\nexport default Base")

        // Act
        val exports = ModuleExports.of(root)

        // Assert
        assertThat(exports.defaultNameOf(anonymous)).isEqualTo(DefaultExports.LEAF_NAME)
        assertThat(exports.defaultNameOf(imported)).isEqualTo(DefaultExports.LEAF_NAME)
    }

    @Test
    fun `should name no default export for a module without one or a Vue component`(
        @TempDir root: File
    ) {
        // Arrange
        val withoutDefault = root.withFile("model.ts", "export class Model {}")
        val component = root.withFile("Button.vue", "<template><button/></template>")

        // Act
        val exports = ModuleExports.of(root)

        // Assert
        assertThat(exports.defaultNameOf(withoutDefault)).isNull()
        assertThat(exports.defaultNameOf(component)).isNull()
    }

    @Test
    fun `should name an exported name by the own declaration it stands for`(
        @TempDir root: File
    ) {
        // Arrange
        val service = root.withFile("service.ts", "class Impl {}\nexport class Plain {}\nexport { Impl as Service }")

        // Act
        val exports = ModuleExports.of(root)

        // Assert
        assertThat(exports.nameOf(service, "Service")).isEqualTo("Impl")
        assertThat(exports.nameOf(service, "Plain")).isEqualTo("Plain")
    }

    @Test
    fun `should re-export through export star every name a source exports by name, none two sources offer`(
        @TempDir root: File
    ) {
        // Arrange
        val first = root.withFile("lib/a.ts", "export class Model {}\nexport class OnlyA {}\nexport default class Base {}\nclass Hidden {}")
        val second = root.withFile("lib/b.ts", "export class Model {}\nexport * from './c'")
        root.withFile("lib/c.ts", "export class FromC {}")

        // Act
        val exports = ModuleExports.of(root).starExports(listOf(first, second), setOf("Own"))

        // Assert
        assertThat(exports).containsExactlyInAnyOrderEntriesOf(mapOf("OnlyA" to first, "FromC" to second))
    }

    @Test
    fun `should read the exports of a module below an analysis root given as a relative path`(
        @TempDir root: File
    ) {
        // Arrange
        val barrel = root.withFile("lib/index.ts", "export * from './model'")
        root.withFile("lib/model.ts", "export class Model {}")
        val relativeRoot = root.relativeTo(File("").absoluteFile)

        // Act
        val exports = ModuleExports.of(relativeRoot).starExports(listOf(barrel.absoluteFile), emptySet())

        // Assert
        assertThat(exports.keys).containsExactly("Model")
    }

    @Test
    fun `should export the module export star as names, also through export star, and none of its names one by one`(
        @TempDir root: File
    ) {
        // Arrange
        val shapes = root.withFile("shapes.ts", "export class Circle {}")
        val lib = root.withFile("lib.ts", "export * as figures from './shapes'")
        val barrel = root.withFile("index.ts", "export * from './lib'")

        // Act
        val exports = ModuleExports.of(root)

        // Assert
        assertThat(exports.moduleExportOf(lib, "figures")?.canonicalFile).isEqualTo(shapes.canonicalFile)
        assertThat(exports.moduleExportOf(barrel, "figures")?.canonicalFile).isEqualTo(shapes.canonicalFile)
        assertThat(exports.moduleExportOf(lib, "Circle")).isNull()
        assertThat(exports.starExports(listOf(lib), emptySet())).isEmpty()
    }
}
