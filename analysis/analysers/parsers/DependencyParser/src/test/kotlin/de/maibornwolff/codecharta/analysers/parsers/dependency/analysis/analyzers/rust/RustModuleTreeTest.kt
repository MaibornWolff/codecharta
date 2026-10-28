package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.rust

import de.maibornwolff.treesitter.excavationsite.api.TreeSitterDependencies
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class RustModuleTreeTest {
    private fun path(slashed: String) = slashed.split("/")

    private fun treeOf(vararg sources: Pair<String, String>): RustModuleTree {
        val bySegments = sources.associate { (file, source) -> path(file) to source }
        return RustModuleTree(
            RustCrates(null, bySegments.keys),
            bySegments.keys
        ) { TreeSitterDependencies.rustModule(bySegments.getValue(it)) }
    }

    private fun RustModuleTree.pathOf(file: String, inlinePath: List<String> = emptyList()) = scopeOf(path(file), inlinePath)?.path

    @Test
    fun `should give a file the module path the mod declarations lead to, in both file layouts`() {
        // Arrange
        val tree = treeOf(
            "game/src/lib.rs" to "pub mod domain;",
            "game/src/domain/mod.rs" to "pub mod model;",
            "game/src/domain/model.rs" to "pub mod creature;",
            "game/src/domain/model/creature.rs" to ""
        )

        // Act
        val modulePath = tree.pathOf("game/src/domain/model/creature.rs")

        // Assert
        assertThat(modulePath).containsExactly("game", "domain", "model", "creature")
    }

    @Test
    fun `should load the file a path attribute names, relative to the declaring file`() {
        // Arrange
        val tree = treeOf(
            "game/src/lib.rs" to "pub mod app;",
            "game/src/app/mod.rs" to "#[path = \"creature_naming.rs\"]\npub mod naming;",
            "game/src/app/creature_naming.rs" to "pub mod inner;",
            "game/src/app/inner.rs" to ""
        )

        // Act
        val naming = tree.pathOf("game/src/app/creature_naming.rs")
        val inner = tree.pathOf("game/src/app/inner.rs")

        // Assert
        assertThat(naming).containsExactly("game", "app", "naming")
        assertThat(inner).containsExactly("game", "app", "naming", "inner")
    }

    @Test
    fun `should load a mod declared in an inline module from the folder of that module`() {
        // Arrange
        val tree = treeOf(
            "game/src/lib.rs" to "pub mod outer { pub mod inner; }",
            "game/src/outer/inner.rs" to ""
        )

        // Act
        val inner = tree.pathOf("game/src/outer/inner.rs")
        val outer = tree.pathOf("game/src/lib.rs", listOf("outer"))

        // Assert
        assertThat(inner).containsExactly("game", "outer", "inner")
        assertThat(outer).containsExactly("game", "outer")
    }

    @Test
    fun `should give a file that library and binary both load to the library`() {
        // Arrange
        val tree = treeOf(
            "game/src/main.rs" to "mod shared;",
            "game/src/lib.rs" to "pub mod shared;",
            "game/src/shared.rs" to ""
        )

        // Act
        val shared = tree.scopeOf(path("game/src/shared.rs"))

        // Assert
        assertThat(shared?.crate?.kind).isEqualTo(CargoTargetKind.LIBRARY)
    }

    @Test
    fun `should keep the file system path for a file no mod declaration reaches`() {
        // Arrange
        val tree = treeOf(
            "game/src/lib.rs" to "",
            "game/src/legacy/old.rs" to "",
            "game/src/legacy/mod.rs" to "",
            "tools/script.rs" to ""
        )

        // Act
        val old = tree.pathOf("game/src/legacy/old.rs")
        val legacy = tree.pathOf("game/src/legacy/mod.rs")
        val script = tree.scopeOf(path("tools/script.rs"))

        // Assert
        assertThat(old).containsExactly("game", "legacy", "old")
        assertThat(legacy).containsExactly("game", "legacy")
        assertThat(script?.path).containsExactly("tools", "script")
        assertThat(script?.crateRootPath).isEmpty()
    }
}
