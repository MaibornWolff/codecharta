package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.rust

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileInfo
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileReport
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.NodeType
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import java.io.File

class RustAnalyzerTest {
    private fun analyze(code: String, physicalPath: String = "src/lib.rs"): FileReport =
        RustAnalyzer(FileInfo(SupportedLanguage.RUST, physicalPath, code)).analyze()

    private fun File.withFiles(vararg files: Pair<String, String>): File {
        files.forEach { (path, content) -> resolve(path).also { it.parentFile.mkdirs() }.writeText(content) }
        return this
    }

    private fun analyzeIn(root: File, physicalPath: String): FileReport =
        RustAnalyzer(FileInfo(SupportedLanguage.RUST, physicalPath, root.resolve(physicalPath).readText(), root)).analyze()

    private fun FileReport.node(name: String) = nodes.first { it.pathWithName.parts.last() == name && it.nodeType != NodeType.REEXPORT }

    private fun FileReport.reexport(name: String) = nodes.first { it.pathWithName.parts.last() == name && it.nodeType == NodeType.REEXPORT }

    private fun FileReport.usesOf(name: String) = node(name).usedTypes.map { it.name }

    @Test
    fun `should prefix node path with the file module derived from the physical path`() {
        // Arrange
        val code = "pub struct UserService {}"

        // Act
        val report = analyze(code, "src/service/users.rs")

        // Assert
        assertThat(report.node("UserService").pathWithName.parts).containsExactly("service", "users", "UserService")
    }

    @Test
    fun `should treat lib rs as the crate root with an empty module path`() {
        // Arrange
        val code = "struct Foo {}"

        // Act
        val report = analyze(code, "src/lib.rs")

        // Assert
        assertThat(report.node("Foo").pathWithName.parts).containsExactly("Foo")
    }

    @Test
    fun `should treat mod rs as the directory module at any depth`() {
        // Arrange
        val code = "struct Foo {}"

        // Act
        val report = analyze(code, "src/a/b/mod.rs")

        // Assert
        assertThat(report.node("Foo").pathWithName.parts).containsExactly("a", "b", "Foo")
    }

    @Test
    fun `should treat a non-root lib rs as a regular file module`() {
        // Arrange
        val code = "struct Foo {}"

        // Act
        val report = analyze(code, "src/feature/lib.rs")

        // Assert
        assertThat(report.node("Foo").pathWithName.parts).containsExactly("feature", "lib", "Foo")
    }

    @Test
    fun `should prefix the node path with the crate folder of a crate without Cargo toml`() {
        // Arrange
        val code = "struct Foo {}"

        // Act
        val report = analyze(code, "/home/dev/crates/core/src/domain/model.rs")

        // Assert
        assertThat(report.node("Foo").pathWithName.parts).containsExactly("core", "domain", "model", "Foo")
    }

    @Test
    fun `should prefix the node path with the crate name of Cargo toml and the module path of the mod declarations`(
        @TempDir root: File
    ) {
        // Arrange
        root.withFiles(
            "game/Cargo.toml" to "[package]\nname = \"my-game\"\nedition = \"2021\"\n",
            "game/src/lib.rs" to "pub mod app;",
            "game/src/app/mod.rs" to "#[path = \"creature_naming.rs\"]\npub mod naming;",
            "game/src/app/creature_naming.rs" to "pub struct Naming;"
        )

        // Act
        val report = analyzeIn(root, "game/src/app/creature_naming.rs")

        // Assert
        assertThat(report.node("Naming").pathWithName.parts).containsExactly("my_game", "app", "naming", "Naming")
    }

    @Test
    fun `should append the inline module chain to the file module path`() {
        // Arrange
        val code = "mod inner { struct Foo {} }"

        // Act
        val report = analyze(code, "src/feature.rs")

        // Assert
        assertThat(report.node("Foo").pathWithName.parts).containsExactly("feature", "inner", "Foo")
    }

    @Test
    fun `should map declaration kinds to node types`() {
        // Arrange
        val code = """
            struct AStruct {}
            enum AnEnum { V }
            trait ATrait {}
            fn a_fn() {}
            type AnAlias = u32;
            const A_CONST: u32 = 0;
            macro_rules! a_macro { () => {} }
        """.trimIndent()

        // Act
        val report = analyze(code)

        // Assert
        assertThat(report.nodes.associate { it.pathWithName.parts.last() to it.nodeType }).containsExactlyInAnyOrderEntriesOf(
            mapOf(
                "AStruct" to NodeType.CLASS,
                "AnEnum" to NodeType.ENUM,
                "ATrait" to NodeType.INTERFACE,
                "a_fn" to NodeType.FUNCTION,
                "AnAlias" to NodeType.CLASS,
                "A_CONST" to NodeType.VARIABLE,
                "a_macro" to NodeType.FUNCTION
            )
        )
    }

    @Test
    fun `should write a use as the exact path of the declaration the lookup finds`() {
        // Arrange
        val code = """
            mod model { pub struct User; pub struct Item; }
            use model::User;
            struct Foo { user: User, items: Vec<model::Item>, map: std::collections::HashMap<u8, u8> }
        """.trimIndent()

        // Act
        val report = analyze(code)

        // Assert
        assertThat(report.usesOf("Foo")).containsExactlyInAnyOrder("model.User", "model.Item")
    }

    @Test
    fun `should resolve crate self and super against the module tree`(
        @TempDir root: File
    ) {
        // Arrange
        root.withFiles(
            "Cargo.toml" to "[package]\nname = \"demo\"\nedition = \"2021\"\n",
            "src/lib.rs" to "pub mod a;\npub mod model;",
            "src/model.rs" to "pub struct User;",
            "src/a/mod.rs" to "pub mod b;\npub struct Sibling;",
            "src/a/b.rs" to
                "pub mod helper { pub struct Helper; }\npub struct Foo { u: crate::model::User, h: self::helper::Helper, s: super::Sibling }"
        )

        // Act
        val report = analyzeIn(root, "src/a/b.rs")

        // Assert
        assertThat(report.usesOf("Foo")).containsExactlyInAnyOrder("demo.model.User", "demo.a.b.helper.Helper", "demo.a.Sibling")
    }

    @Test
    fun `should fold an impl in the type's file into the type`() {
        // Arrange
        val code = """
            trait Fightable {}
            struct Speed;
            struct Foo {}
            impl Fightable for Foo {}
            impl Foo { fn speed(&self) -> Speed { Speed } }
        """.trimIndent()

        // Act
        val report = analyze(code)

        // Assert
        assertThat(report.usesOf("Foo")).containsExactlyInAnyOrder("Fightable", "Speed")
    }

    @Test
    fun `should make an impl in another file the implementation part of its type, which uses the type`(
        @TempDir root: File
    ) {
        // Arrange
        root.withFiles(
            "Cargo.toml" to "[package]\nname = \"demo\"\nedition = \"2021\"\n",
            "src/lib.rs" to "pub mod display;\npub mod model;",
            "src/model.rs" to "pub struct Creature;\npub struct Speed;\npub trait Fightable {}",
            "src/display.rs" to "use crate::model::{Creature, Fightable, Speed};\nimpl Creature { fn speed(&self) -> Speed { Speed } }\n" +
                "impl Fightable for Vec<Speed> {}"
        )

        // Act
        val report = analyzeIn(root, "src/display.rs")

        // Assert
        assertThat(report.nodes.map { Triple(it.pathWithName.withDots(), it.isImplementationPart, it.usedTypes.map { type -> type.name }) })
            .containsExactlyInAnyOrder(
                Triple("demo.model.Creature", true, listOf("demo.model.Creature", "demo.model.Speed")),
                Triple("demo.model.Fightable", true, listOf("demo.model.Fightable", "demo.model.Speed"))
            )
    }

    @Test
    fun `should make a re-export declaration of a pub use that uses what it names`(
        @TempDir root: File
    ) {
        // Arrange
        root.withFiles(
            "Cargo.toml" to "[package]\nname = \"demo\"\nedition = \"2021\"\n",
            "src/lib.rs" to "pub mod model;",
            "src/model/mod.rs" to "mod creature;\npub use creature::Creature;\npub(crate) use std::fmt::Display;",
            "src/model/creature.rs" to "pub struct Creature;"
        )

        // Act
        val report = analyzeIn(root, "src/model/mod.rs")

        // Assert
        assertThat(report.nodes.map { it.pathWithName.withDots() }).containsExactly("demo.model.Creature")
        assertThat(report.reexport("Creature").usedTypes.map { it.name }).containsExactly("demo.model.creature.Creature")
    }

    @Test
    fun `should make one re-export per name a glob re-export offers`(
        @TempDir root: File
    ) {
        // Arrange
        root.withFiles(
            "Cargo.toml" to "[package]\nname = \"demo\"\nedition = \"2021\"\n",
            "src/lib.rs" to "pub mod model;",
            "src/model/mod.rs" to "mod creature;\npub use creature::*;\npub struct Speed;",
            "src/model/creature.rs" to "pub struct Creature;\npub struct Speed;\nstruct Hidden;"
        )

        // Act
        val report = analyzeIn(root, "src/model/mod.rs")

        // Assert
        assertThat(
            report.nodes
                .filter {
                    it.nodeType == NodeType.REEXPORT
                }.map { it.pathWithName.withDots() }
        ).containsExactly("demo.model.Creature")
    }

    @Test
    fun `should write a use through another module's re-export as the re-export`(
        @TempDir root: File
    ) {
        // Arrange
        root.withFiles(
            "Cargo.toml" to "[package]\nname = \"demo\"\nedition = \"2021\"\n",
            "src/lib.rs" to "pub mod arena;\npub mod model;",
            "src/model/mod.rs" to "mod creature;\npub use creature::Creature;",
            "src/model/creature.rs" to "pub struct Creature;",
            "src/arena.rs" to "use crate::model::Creature;\npub struct Arena { boss: Creature }"
        )

        // Act
        val report = analyzeIn(root, "src/arena.rs")

        // Assert
        assertThat(report.usesOf("Arena")).containsExactly("demo.model.Creature")
    }

    @Test
    fun `should resolve a path into another crate of the workspace`(
        @TempDir root: File
    ) {
        // Arrange
        root.withFiles(
            "domain/Cargo.toml" to "[package]\nname = \"domain\"\nedition = \"2021\"\n",
            "domain/src/lib.rs" to "pub mod workshop;",
            "domain/src/workshop.rs" to "pub struct Workshop;",
            "app/Cargo.toml" to "[package]\nname = \"app\"\nedition = \"2021\"\n",
            "app/src/lib.rs" to "use domain::workshop::Workshop;\npub struct Service { w: Workshop }"
        )

        // Act
        val report = analyzeIn(root, "app/src/lib.rs")

        // Assert
        assertThat(report.usesOf("Service")).containsExactly("domain.workshop.Workshop")
    }

    @Test
    fun `should derive the module path for a file outside any src directory`() {
        // Arrange
        val code = "struct Foo {}"

        // Act
        val report = analyze(code, "build.rs")

        // Assert
        assertThat(report.node("Foo").pathWithName.parts).containsExactly("build", "Foo")
    }

    @Test
    fun `should leave out cfg test code in a run that analyses no Rust test file`(
        @TempDir root: File
    ) {
        // Arrange
        root.withFiles(
            "Cargo.toml" to "[package]\nname = \"demo\"\nedition = \"2021\"\n",
            "src/lib.rs" to "pub mod model;\n#[cfg(test)]\nmod fixtures;",
            "src/model.rs" to "pub struct Creature;\n#[cfg(test)]\nmod tests { pub struct Fake { boss: super::Creature } }",
            "src/fixtures.rs" to "pub struct Fixture;",
            "tests/smoke.rs" to ""
        )
        val withoutTests = setOf("src/lib.rs", "src/model.rs", "src/fixtures.rs")

        fun analyzeRun(file: String, analysedFiles: Set<String>) =
            RustAnalyzer(FileInfo(SupportedLanguage.RUST, file, root.resolve(file).readText(), root, analysedFiles)).analyze()

        // Act
        val model = analyzeRun("src/model.rs", withoutTests)
        val fixtures = analyzeRun("src/fixtures.rs", withoutTests)
        val modelWithTests = analyzeRun("src/model.rs", withoutTests + "tests/smoke.rs")

        // Assert
        assertThat(model.nodes.map { it.pathWithName.withDots() }).containsExactly("demo.model.Creature")
        assertThat(fixtures.nodes).isEmpty()
        assertThat(
            modelWithTests.nodes.map {
                it.pathWithName.withDots()
            }
        ).containsExactlyInAnyOrder("demo.model.Creature", "demo.model.tests.Fake")
    }

    @Test
    fun `should produce an empty report for an empty file`() {
        // Arrange
        val code = ""

        // Act
        val report = analyze(code)

        // Assert
        assertThat(report.nodes).isEmpty()
    }

    @Test
    fun `should produce an empty report for a blank physical path`() {
        // Arrange
        val code = "struct Foo {}"

        // Act
        val report = analyze(code, "")

        // Assert
        assertThat(report.nodes).isEmpty()
    }

    @Test
    fun `should ignore current-directory segments in the physical path`() {
        // Arrange
        val code = "struct Foo {}"

        // Act
        val report = analyze(code, "./src/./service.rs")

        // Assert
        assertThat(report.node("Foo").pathWithName.parts).containsExactly("service", "Foo")
    }
}
