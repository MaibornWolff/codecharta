package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.rust

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class CargoManifestReaderTest {
    @Test
    fun `should read the package name, the edition and the library table`() {
        // Arrange
        val text = """
            [package]
            name = "my-game" # the package
            edition = "2021"

            [lib]
            name = "engine"
            path = "src/engine.rs"
        """.trimIndent()

        // Act
        val manifest = CargoManifestReader.parse(text)

        // Assert
        assertThat(manifest).isEqualTo(
            CargoManifest(packageName = "my-game", edition = "2021", libraryName = "engine", libraryPath = "src/engine.rs")
        )
    }

    @Test
    fun `should read an edition inherited from the workspace and the workspace's own edition`() {
        // Arrange
        val text = """
            [workspace.package]
            edition = "2024"

            [package]
            name = "app"
            edition.workspace = true
        """.trimIndent()

        // Act
        val manifest = CargoManifestReader.parse(text)

        // Assert
        assertThat(manifest.inheritsEdition).isTrue()
        assertThat(manifest.workspaceEdition).isEqualTo("2024")
        assertThat(manifest.edition).isNull()
    }

    @Test
    fun `should read the listed binary, test, example and bench targets`() {
        // Arrange
        val text = """
            [[bin]]
            name = "cli"
            path = "src/cli/main.rs"

            [[test]]
            name = "smoke"
        """.trimIndent()

        // Act
        val targets = CargoManifestReader.parse(text).targets

        // Assert
        assertThat(targets).containsExactly(
            CargoTarget(CargoTargetKind.BINARY, "cli", "src/cli/main.rs"),
            CargoTarget(CargoTargetKind.TEST, "smoke", null)
        )
    }

    @Test
    fun `should read the dependencies a manifest renames in any dependency table`() {
        // Arrange
        val text = """
            [dependencies]
            gm = { path = "../model", package = "game-model" }
            log = "0.4"

            [dev-dependencies.fixtures]
            package = "game-fixtures"

            [target.'cfg(unix)'.dependencies]
            "sys" = { package = "game-sys", version = "1" }
        """.trimIndent()

        // Act
        val renames = CargoManifestReader.parse(text).renamedDependencies

        // Assert
        assertThat(renames).containsExactlyInAnyOrderEntriesOf(
            mapOf("gm" to "game-model", "fixtures" to "game-fixtures", "sys" to "game-sys")
        )
    }

    @Test
    fun `should keep a hash inside a quoted value`() {
        // Arrange
        val text = "[package]\nname = \"a#b\""

        // Act
        val manifest = CargoManifestReader.parse(text)

        // Assert
        assertThat(manifest.packageName).isEqualTo("a#b")
    }
}
