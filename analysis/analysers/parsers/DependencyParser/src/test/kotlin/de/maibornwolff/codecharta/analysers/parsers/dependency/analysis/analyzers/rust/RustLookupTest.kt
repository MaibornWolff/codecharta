package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.rust

import de.maibornwolff.treesitter.excavationsite.api.RustNamespace
import de.maibornwolff.treesitter.excavationsite.api.RustPath
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import java.io.File

class RustLookupTest {
    private fun File.withFiles(vararg files: Pair<String, String>): File {
        files.forEach { (path, content) -> resolve(path).also { it.parentFile.mkdirs() }.writeText(content) }
        return this
    }

    private fun meaningsOf(
        root: File,
        file: String,
        written: String,
        namespace: RustNamespace = RustNamespace.TYPE,
        offset: Int = 0
    ): List<Meaning> {
        val project = RustProject.of(root, emptySet())
        val scope = checkNotNull(project.tree.scopeOf(file.split("/")))
        return RustLookup(project.tree, project.crates).resolve(RustPath(written.split("::"), namespace, offset), scope)
    }

    private fun pathsOf(
        root: File,
        file: String,
        written: String,
        namespace: RustNamespace = RustNamespace.TYPE,
        offset: Int = 0
    ) = meaningsOf(root, file, written, namespace, offset).map { it.declarationPath?.joinToString(".") }

    private val manifest = "Cargo.toml" to "[package]\nname = \"demo\"\nedition = \"2021\"\n"

    @Test
    fun `should find an item of the own module before a glob and an explicit use before a glob`(
        @TempDir root: File
    ) {
        // Arrange
        root.withFiles(
            manifest,
            "src/lib.rs" to "pub mod a;\npub mod b;\npub mod user;",
            "src/a.rs" to "pub struct Creature;\npub struct Speed;",
            "src/b.rs" to "pub struct Speed;",
            "src/user.rs" to "use crate::a::*;\nuse crate::b::Speed;\npub struct Creature;"
        )

        // Act
        val creature = pathsOf(root, "src/user.rs", "Creature")
        val speed = pathsOf(root, "src/user.rs", "Speed")

        // Assert
        assertThat(creature).containsExactly("demo.user.Creature")
        assertThat(speed).containsExactly("demo.b.Speed")
    }

    @Test
    fun `should find nothing for a name two globs offer and only what a glob may see`(
        @TempDir root: File
    ) {
        // Arrange
        root.withFiles(
            manifest,
            "src/lib.rs" to "pub mod a;\npub mod b;\npub mod user;",
            "src/a.rs" to "pub struct Creature;\nstruct Hidden;",
            "src/b.rs" to "pub struct Creature;",
            "src/user.rs" to "use crate::a::*;\nuse crate::b::*;"
        )

        // Act
        val creature = pathsOf(root, "src/user.rs", "Creature")
        val hidden = pathsOf(root, "src/user.rs", "Hidden")

        // Assert
        assertThat(creature).isEmpty()
        assertThat(hidden).isEmpty()
    }

    @Test
    fun `should mean the enum for a variant a glob imports and the type for a path into it`(
        @TempDir root: File
    ) {
        // Arrange
        root.withFiles(
            manifest,
            "src/lib.rs" to "pub mod speed;\npub mod user;",
            "src/speed.rs" to "pub enum SpeedType { Walking, Flying }\npub struct Creature;",
            "src/user.rs" to "use crate::speed::SpeedType::*;\nuse crate::speed::Creature;"
        )

        // Act
        val variant = pathsOf(root, "src/user.rs", "Walking", RustNamespace.VALUE)
        val associated = pathsOf(root, "src/user.rs", "Creature::new", RustNamespace.VALUE)

        // Assert
        assertThat(variant).containsExactly("demo.speed.SpeedType")
        assertThat(associated).containsExactly("demo.speed.Creature")
    }

    @Test
    fun `should mean the re-export for a name another module re-exports and the declaration for a private use`(
        @TempDir root: File
    ) {
        // Arrange
        root.withFiles(
            manifest,
            "src/lib.rs" to "pub mod model;\npub mod speed;\npub mod app;",
            "src/model/mod.rs" to "mod creature;\npub use creature::Creature;",
            "src/model/creature.rs" to "pub struct Creature;",
            "src/speed.rs" to "pub struct Speed;",
            "src/app/mod.rs" to "use crate::speed::Speed as Pace;\npub mod child;",
            "src/app/child.rs" to ""
        )

        // Act
        val throughBarrel = meaningsOf(root, "src/app/child.rs", "crate::model::Creature")
        val throughParent = meaningsOf(root, "src/app/child.rs", "super::Pace")

        // Assert
        assertThat(throughBarrel.single()).isInstanceOf(Meaning.Reexport::class.java)
        assertThat(throughBarrel.single().declarationPath).containsExactly("demo", "model", "Creature")
        assertThat(throughParent.single()).isInstanceOf(Meaning.Declared::class.java)
        assertThat(throughParent.single().declarationPath).containsExactly("demo", "speed", "Speed")
    }

    @Test
    fun `should find nothing for a library path and a prelude name`(
        @TempDir root: File
    ) {
        // Arrange
        root.withFiles(manifest, "src/lib.rs" to "pub mod user;", "src/user.rs" to "")

        // Act
        val library = pathsOf(root, "src/user.rs", "std::collections::HashMap")
        val prelude = pathsOf(root, "src/user.rs", "Vec")

        // Assert
        assertThat(library).isEmpty()
        assertThat(prelude).isEmpty()
    }

    @Test
    fun `should find another crate through a renamed dependency and an extern crate alias`(
        @TempDir root: File
    ) {
        // Arrange
        root.withFiles(
            "model/Cargo.toml" to "[package]\nname = \"game-model\"\nedition = \"2021\"\n",
            "model/src/lib.rs" to "pub struct Creature;",
            "app/Cargo.toml" to
                "[package]\nname = \"app\"\nedition = \"2021\"\n\n[dependencies]\ngm = { path = \"../model\", package = \"game-model\" }\n",
            "app/src/lib.rs" to "extern crate game_model as model;"
        )

        // Act
        val renamed = pathsOf(root, "app/src/lib.rs", "gm::Creature")
        val aliased = pathsOf(root, "app/src/lib.rs", "model::Creature")
        val leading = pathsOf(root, "app/src/lib.rs", "::game_model::Creature")

        // Assert
        assertThat(renamed).containsExactly("game_model.Creature")
        assertThat(aliased).containsExactly("game_model.Creature")
        assertThat(leading).containsExactly("game_model.Creature")
    }

    @Test
    fun `should start a use path at the crate root in edition 2015`(
        @TempDir root: File
    ) {
        // Arrange
        root.withFiles(
            "Cargo.toml" to "[package]\nname = \"old\"\n",
            "src/lib.rs" to "pub mod app;\npub mod model;",
            "src/model.rs" to "pub struct Creature;",
            "src/app.rs" to "use model::Creature;"
        )

        // Act
        val creature = pathsOf(root, "src/app.rs", "Creature")

        // Assert
        assertThat(creature).containsExactly("old.model.Creature")
    }

    @Test
    fun `should find a macro by textual scope and an exported macro at the crate root`(
        @TempDir root: File
    ) {
        // Arrange
        root.withFiles(
            manifest,
            "src/lib.rs" to "macro_rules! clamp { () => {} }\npub mod fight;\npub mod dice;",
            "src/dice.rs" to "#[macro_export]\nmacro_rules! roll { () => {} }",
            "src/fight.rs" to ""
        )

        // Act
        val textual = pathsOf(root, "src/fight.rs", "clamp", RustNamespace.MACRO)
        val exported = pathsOf(root, "src/fight.rs", "crate::roll", RustNamespace.MACRO)

        // Assert
        assertThat(textual).containsExactly("demo.clamp")
        assertThat(exported).containsExactly("demo.dice.roll")
    }

    @Test
    fun `should look a name up in the globs of the blocks around it first`(
        @TempDir root: File
    ) {
        // Arrange
        root.withFiles(
            manifest,
            "src/lib.rs" to "pub mod dice;\npub mod fight;",
            "src/dice.rs" to "pub fn roll() {}",
            "src/fight.rs" to "pub fn roll() {}"
        )
        val project = RustProject.of(root, emptySet())
        val scope = checkNotNull(project.tree.scopeOf(listOf("src", "fight.rs")))
        val written = RustPath(listOf("roll"), RustNamespace.VALUE, 0, listOf(listOf("crate", "dice")))

        // Act
        val meanings = RustLookup(project.tree, project.crates).resolve(written, scope)

        // Assert
        assertThat(meanings.map { it.declarationPath }).containsExactly(listOf("demo", "dice", "roll"))
    }
}
