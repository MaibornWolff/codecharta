package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.rust

import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.tuple
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import java.io.File

class RustCratesTest {
    private fun File.withFile(path: String, content: String = ""): File {
        resolve(path).also { it.parentFile.mkdirs() }.writeText(content)
        return this
    }

    private fun path(slashed: String) = slashed.split("/")

    private fun rustFiles(vararg slashed: String) = slashed.mapTo(HashSet()) { path(it) }

    @Test
    fun `should find the targets of a package in Cargo's order with their crate names`(
        @TempDir root: File
    ) {
        // Arrange
        root.withFile("game/Cargo.toml", "[package]\nname = \"my-game\"\nedition = \"2021\"\n")
        val files = rustFiles(
            "game/src/lib.rs",
            "game/src/main.rs",
            "game/src/bin/tool.rs",
            "game/src/bin/admin/main.rs",
            "game/tests/arena.rs",
            "game/examples/demo.rs",
            "game/benches/speed.rs",
            "game/src/model.rs"
        )

        // Act
        val crates = RustCrates(root, files).crates

        // Assert
        assertThat(crates).extracting("name", "kind", "edition").containsExactly(
            tuple("my_game", CargoTargetKind.LIBRARY, 2021),
            tuple("my_game", CargoTargetKind.BINARY, 2021),
            tuple("admin", CargoTargetKind.BINARY, 2021),
            tuple("tool", CargoTargetKind.BINARY, 2021),
            tuple("arena", CargoTargetKind.TEST, 2021),
            tuple("demo", CargoTargetKind.EXAMPLE, 2021),
            tuple("speed", CargoTargetKind.BENCH, 2021)
        )
    }

    @Test
    fun `should name the library by lib name and read a target path the manifest lists`(
        @TempDir root: File
    ) {
        // Arrange
        root.withFile(
            "Cargo.toml",
            "[package]\nname = \"game\"\n\n[lib]\nname = \"engine\"\npath = \"core/engine.rs\"\n\n[[bin]]\nname = \"cli\"\npath = \"cli/run.rs\"\n"
        )

        // Act
        val crates = RustCrates(root, rustFiles("core/engine.rs", "cli/run.rs")).crates

        // Assert
        assertThat(crates).extracting("name", "rootFile").containsExactly(
            tuple("engine", path("core/engine.rs")),
            tuple("cli", path("cli/run.rs"))
        )
    }

    @Test
    fun `should read the edition 2015 where a manifest names none and inherit the workspace's`(
        @TempDir root: File
    ) {
        // Arrange
        root
            .withFile("Cargo.toml", "[workspace]\nmembers = [\"old\", \"new\"]\n\n[workspace.package]\nedition = \"2024\"\n")
            .withFile("old/Cargo.toml", "[package]\nname = \"old\"\n")
            .withFile("new/Cargo.toml", "[package]\nname = \"new\"\nedition.workspace = true\n")

        // Act
        val crates = RustCrates(root, rustFiles("old/src/lib.rs", "new/src/lib.rs")).crates

        // Assert
        assertThat(crates).extracting("name", "edition").containsExactly(tuple("new", 2024), tuple("old", 2015))
    }

    @Test
    fun `should make a crate of a lib rs in a src folder of no package, named after the folder above`() {
        // Arrange
        val files = rustFiles("game/src/lib.rs", "game/src/main.rs", "game/src/model.rs", "src/lib.rs")

        // Act
        val crates = RustCrates(null, files).crates

        // Assert
        assertThat(crates).extracting("name", "kind", "edition").containsExactly(
            tuple("game", CargoTargetKind.LIBRARY, 2021),
            tuple("game", CargoTargetKind.BINARY, 2021),
            tuple("", CargoTargetKind.LIBRARY, 2021)
        )
    }

    @Test
    fun `should keep the renamed dependencies of a package on its crates`(
        @TempDir root: File
    ) {
        // Arrange
        root.withFile(
            "app/Cargo.toml",
            "[package]\nname = \"app\"\n\n[dependencies]\ngm = { path = \"../model\", package = \"game-model\" }\n"
        )

        // Act
        val crate = RustCrates(root, rustFiles("app/src/lib.rs")).crates.single()

        // Assert
        assertThat(crate.renamedDependencies).containsExactlyEntriesOf(mapOf("gm" to "game-model"))
    }
}
