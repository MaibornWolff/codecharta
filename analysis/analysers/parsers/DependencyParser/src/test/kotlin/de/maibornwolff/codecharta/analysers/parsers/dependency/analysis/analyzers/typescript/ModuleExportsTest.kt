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
}
