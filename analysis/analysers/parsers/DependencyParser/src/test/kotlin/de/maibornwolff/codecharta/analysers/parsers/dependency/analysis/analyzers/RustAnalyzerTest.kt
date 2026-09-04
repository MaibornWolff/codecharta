package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.rust.RustAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Dependency
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileInfo
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileReport
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Node
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.NodeType
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Type
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
import de.maibornwolff.codecharta.analysers.parsers.dependency.processing.dependencies.DependencyResolverService
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class RustAnalyzerTest {
    private fun analyze(code: String, physicalPath: String = "src/lib.rs"): FileReport =
        RustAnalyzer(FileInfo(SupportedLanguage.RUST, physicalPath, code)).analyze()

    private fun FileReport.node(name: String) = nodes.first { it.pathWithName.parts.last() == name }

    @Test
    fun `should prefix node path with the file module derived from the physical path`() {
        // Given
        val code = "pub struct UserService {}"

        // When
        val report = analyze(code, "src/service/users.rs")

        // Then
        assertThat(report.node("UserService").pathWithName.parts).containsExactly("service", "users", "UserService")
    }

    @Test
    fun `should treat lib rs as the crate root with an empty module path`() {
        // Given
        val code = "struct Root {}"

        // When
        val report = analyze(code, "src/lib.rs")

        // Then
        assertThat(report.node("Root").pathWithName.parts).containsExactly("Root")
    }

    @Test
    fun `should treat mod rs as the directory module at any depth`() {
        // Given
        val code = "struct Foo {}"

        // When
        val report = analyze(code, "src/feature/sub/mod.rs")

        // Then
        assertThat(report.node("Foo").pathWithName.parts).containsExactly("feature", "sub", "Foo")
    }

    @Test
    fun `should treat a non-root lib rs as a regular file module`() {
        // Given
        val code = "struct Foo {}"

        // When
        val report = analyze(code, "src/feature/lib.rs")

        // Then
        assertThat(report.node("Foo").pathWithName.parts).containsExactly("feature", "lib", "Foo")
    }

    @Test
    fun `should prefix the node path with the crate name in a workspace layout`() {
        // Given
        val code = "struct Foo {}"

        // When
        val report = analyze(code, "/home/dev/crates/core/src/domain/model.rs")

        // Then — the crate dir before src ("core") is prepended so cross-crate imports can resolve
        assertThat(report.node("Foo").pathWithName.parts).containsExactly("core", "domain", "model", "Foo")
    }

    @Test
    fun `should resolve crate imports against the crate name so they match cross-crate references`() {
        // Given — a file in crate "domain" that references a sibling module via crate::
        val code = """
            use crate::workshop::Workshop;
            pub struct Service { w: Workshop }
        """.trimIndent()

        // When
        val report = analyze(code, "/repo/crates/domain/src/service.rs")

        // Then — the node carries the crate name, and crate:: resolves to [domain, ...] (not dropped),
        // so it is byte-identical to how another crate would import it via use domain::workshop::Workshop
        assertThat(report.node("Service").pathWithName.parts).containsExactly("domain", "service", "Service")
        assertThat(report.node("Service").dependencies).contains(
            Dependency(Path(listOf("domain", "workshop", "Workshop")))
        )
    }

    @Test
    fun `should append the inline module chain to the file module path`() {
        // Given
        val code = "mod inner { struct Foo {} }"

        // When
        val report = analyze(code, "src/feature.rs")

        // Then
        assertThat(report.node("Foo").pathWithName.parts).containsExactly("feature", "inner", "Foo")
    }

    @Test
    fun `should map regular use imports including glob and alias to dependencies`() {
        // Given — regular `use` imports (a `pub use` would be a forwarding node, not a dependency)
        val code = """
            use std::collections::HashMap;
            use a::b::*;
            use x::Y as Z;
            struct Foo {}
        """.trimIndent()

        // When
        val report = analyze(code, "src/lib.rs")

        // Then
        assertThat(report.node("Foo").dependencies).contains(
            Dependency(Path(listOf("std", "collections", "HashMap"))),
            Dependency(Path(listOf("a", "b")), isWildcard = true),
            Dependency(Path(listOf("x", "Y")))
        )
    }

    @Test
    fun `should normalize crate self and super import segments against the file module path`() {
        // Given
        val code = """
            use crate::model::User;
            use self::helper::Helper;
            use super::sibling::Sibling;
            struct Foo {}
        """.trimIndent()

        // When
        val report = analyze(code, "src/a/b.rs")

        // Then
        assertThat(report.node("Foo").dependencies).contains(
            Dependency(Path(listOf("model", "User"))),
            Dependency(Path(listOf("a", "b", "helper", "Helper"))),
            Dependency(Path(listOf("a", "sibling", "Sibling")))
        )
    }

    @Test
    fun `should add an intra-module self wildcard dependency per declaration`() {
        // Given
        val code = "struct Foo {}"

        // When
        val report = analyze(code, "src/a/b.rs")

        // Then
        assertThat(report.node("Foo").dependencies).contains(Dependency.asWildcard(listOf("a", "b")))
    }

    @Test
    fun `should map declaration kinds to node types`() {
        // Given
        val code = """
            struct AStruct {}
            enum AnEnum { V }
            trait ATrait {}
            fn a_fn() {}
            type AnAlias = u32;
            const A_CONST: u32 = 0;
        """.trimIndent()

        // When
        val report = analyze(code, "src/lib.rs")

        // Then
        assertThat(report.node("AStruct").nodeType).isEqualTo(NodeType.CLASS)
        assertThat(report.node("AnEnum").nodeType).isEqualTo(NodeType.ENUM)
        assertThat(report.node("ATrait").nodeType).isEqualTo(NodeType.INTERFACE)
        assertThat(report.node("a_fn").nodeType).isEqualTo(NodeType.FUNCTION)
        assertThat(report.node("AnAlias").nodeType).isEqualTo(NodeType.CLASS)
        assertThat(report.node("A_CONST").nodeType).isEqualTo(NodeType.VARIABLE)
    }

    @Test
    fun `should fold impl trait for type into the target type as an inheritance used type`() {
        // Given
        val code = """
            struct Foo {}
            impl Display for Foo {
                fn fmt(&self, f: Formatter) -> Result { todo!() }
            }
        """.trimIndent()

        // When
        val report = analyze(code, "src/lib.rs")

        // Then
        assertThat(report.node("Foo").usedTypes).contains(Type.simple("Display"), Type.simple("Formatter"))
    }

    @Test
    fun `should extract signature used types with nested generics`() {
        // Given
        val code = "struct Foo { bar: Bar, items: Vec<Item> }"

        // When
        val report = analyze(code, "src/lib.rs")

        // Then
        assertThat(report.node("Foo").usedTypes).containsExactlyInAnyOrder(
            Type.simple("Bar"),
            Type.generic("Vec", listOf(Type.simple("Item")))
        )
    }

    @Test
    fun `should emit a synthetic wildcard dependency for a qualified inline type`() {
        // Given
        val code = "struct S { f: crate::events::Event }"

        // When
        val report = analyze(code, "src/lib.rs")

        // Then
        val foo = report.node("S")
        assertThat(foo.usedTypes).contains(Type.simple("Event"))
        assertThat(foo.dependencies).contains(Dependency.asWildcard(listOf("events")))
    }

    @Test
    fun `should produce an empty report for an empty file`() {
        // Given
        val code = ""

        // When
        val report = analyze(code, "src/lib.rs")

        // Then
        assertThat(report.nodes).isEmpty()
    }

    @Test
    fun `should create a forwarding node for a pub use re-export`() {
        // Given — a crate's lib.rs flattens its public API via pub use
        val code = "pub use workshop::Workshop;"

        // When
        val report = analyze(code, "/repo/crates/domain/src/lib.rs")

        // Then — a REEXPORT node domain.Workshop forwards to the real definition domain.workshop.Workshop
        val node = report.node("Workshop")
        assertThat(node.nodeType).isEqualTo(NodeType.REEXPORT)
        assertThat(node.pathWithName.parts).containsExactly("domain", "Workshop")
        assertThat(node.dependencies).contains(Dependency(Path(listOf("domain", "workshop", "Workshop"))))
    }

    @Test
    fun `should resolve a consumer through a flattened pub use re-export without a cycle`() {
        // Given — domain defines a self-referencing Workshop in a submodule and re-exports it from
        // lib.rs; a consumer in another crate imports the flattened path `use domain::Workshop`
        val workshopMod = analyze(
            """
            pub struct Workshop { id: String }
            impl Workshop { pub fn clone_it(&self) -> Workshop { todo!() } }
            """.trimIndent(),
            "/repo/crates/domain/src/workshop.rs"
        )
        val domainLib = analyze("pub use workshop::Workshop;", "/repo/crates/domain/src/lib.rs")
        val consumer = analyze(
            """
            use domain::Workshop;
            pub fn render(w: &Workshop) -> String { String::new() }
            """.trimIndent(),
            "/repo/crates/adapter_exporter/src/markdown.rs"
        )

        // When
        val resolved = DependencyResolverService.resolveNodes(listOf(workshopMod, domainLib, consumer))

        // Then — the carrier node is folded into an alias and dropped; render resolves straight to the
        // real definition, and the self-reference does NOT create a domain.Workshop ↔ definition cycle
        assertThat(resolved.map { it.pathWithName.withDots() }).doesNotContain("domain.Workshop")
        val render = resolved.first { it.pathWithName.parts.last() == "render" }
        assertThat(render.resolvedNodeDependencies.internalDependencies.map { it.path.withDots() })
            .containsExactly("domain.workshop.Workshop")
        val workshop = resolved.first { it.pathWithName.withDots() == "domain.workshop.Workshop" }
        assertThat(workshop.resolvedNodeDependencies.internalDependencies).isEmpty()
    }

    @Test
    fun `should resolve a cross-crate dependency to an internal edge`() {
        // Given — a type in crate "domain" used by a free function in crate "adapter" via use domain::...
        val domain = RustAnalyzer(
            FileInfo(SupportedLanguage.RUST, "/repo/crates/domain/src/workshop.rs", "pub struct Workshop { id: String }")
        ).analyze()
        val adapter = RustAnalyzer(
            FileInfo(
                SupportedLanguage.RUST,
                "/repo/crates/adapter_exporter/src/markdown.rs",
                """
                use domain::workshop::Workshop;
                pub fn render(workshop: &Workshop) -> String { String::new() }
                """.trimIndent()
            )
        ).analyze()

        // When — the cross-file resolver connects the graph
        val resolved = DependencyResolverService.resolveNodes(listOf(domain, adapter))

        // Then — render's signature use of Workshop becomes an INTERNAL edge to domain.workshop.Workshop
        val render = resolved.first { it.pathWithName.parts.last() == "render" }
        assertThat(render.resolvedNodeDependencies.internalDependencies.map { it.path.withDots() })
            .contains("domain.workshop.Workshop")
    }

    @Test
    fun `should resolve crate and self prefixes in pub use re-exports to the crate-rooted target`() {
        // Given — a crate root re-exporting via both crate:: and self::
        val code = """
            pub use crate::workshop::Workshop;
            pub use self::finding::Finding;
        """.trimIndent()

        // When
        val report = analyze(code, "/repo/crates/domain/src/lib.rs")

        // Then — both forms resolve to the crate-rooted definition path
        assertThat(report.node("Workshop").dependencies).contains(Dependency(Path(listOf("domain", "workshop", "Workshop"))))
        assertThat(report.node("Finding").dependencies).contains(Dependency(Path(listOf("domain", "finding", "Finding"))))
    }

    @Test
    fun `should resolve a super prefix in a pub use re-export from a submodule`() {
        // Given — a submodule re-exporting a sibling-of-parent item via super::
        val code = "pub use super::shared::Helper;"

        // When
        val report = analyze(code, "/repo/crates/domain/src/feature/mod.rs")

        // Then — fileModulePath [domain, feature]; super:: strips one segment -> [domain, shared, Helper]
        val helper = report.node("Helper")
        assertThat(helper.nodeType).isEqualTo(NodeType.REEXPORT)
        assertThat(helper.pathWithName.parts).containsExactly("domain", "feature", "Helper")
        assertThat(helper.dependencies).contains(Dependency(Path(listOf("domain", "shared", "Helper"))))
    }

    @Test
    fun `should not emit a node for a glob pub use re-export`() {
        // Given — a wildcard re-export (needs cross-file expansion; out of scope)
        val code = "pub use internal::*;"

        // When
        val report = analyze(code, "/repo/crates/domain/src/lib.rs")

        // Then — no forwarding node is synthesized for a glob re-export
        assertThat(report.nodes).isEmpty()
    }

    @Test
    fun `should normalize chained super segments in imports`() {
        // Given — a deep module importing via super::super::
        val code = """
            use super::super::shared::Helper;
            struct Foo { h: Helper }
        """.trimIndent()

        // When
        val report = analyze(code, "/repo/crates/domain/src/a/b.rs")

        // Then — fileModulePath [domain, a, b]; two supers strip two segments -> [domain, shared, Helper]
        assertThat(report.node("Foo").dependencies).contains(Dependency(Path(listOf("domain", "shared", "Helper"))))
    }

    @Test
    fun `should derive the module path for a file outside any src directory`() {
        // Given — a build script with no enclosing src/ directory
        val code = "struct Foo {}"

        // When
        val report = analyze(code, "build.rs")

        // Then — falls back to the file name as the module segment, with no crate prefix
        assertThat(report.node("Foo").pathWithName.parts).containsExactly("build", "Foo")
    }

    @Test
    fun `should derive an empty module path for a blank physical path`() {
        // Given — no physical path information at all
        val code = "struct Foo {}"

        // When
        val report = analyze(code, "")

        // Then — the node sits at the (empty) crate root
        assertThat(report.node("Foo").pathWithName.parts).containsExactly("Foo")
    }

    @Test
    fun `should ignore current-directory segments in the physical path`() {
        // Given — a path with a leading ./ segment
        val code = "struct Foo {}"

        // When
        val report = analyze(code, "./crates/domain/src/model.rs")

        // Then — the "." segment is dropped; crate name and module are derived normally
        assertThat(report.node("Foo").pathWithName.parts).containsExactly("domain", "model", "Foo")
    }

    @Test
    fun `should drop a re-export carrier that has no concrete target`() {
        // Given — a synthetic RUST re-export node whose only dependency is a wildcard (no concrete target)
        val carrier = Node(
            pathWithName = Path(listOf("domain", "Foo")),
            physicalPath = "x",
            nodeType = NodeType.REEXPORT,
            language = SupportedLanguage.RUST,
            dependencies = setOf(Dependency.asWildcard(listOf("domain"))),
            usedTypes = emptySet()
        )

        // When
        val resolved = DependencyResolverService.resolveNodes(listOf(FileReport(listOf(carrier))))

        // Then — with no concrete target to alias onto, the carrier is dropped without error
        assertThat(resolved.map { it.pathWithName.withDots() }).doesNotContain("domain.Foo")
    }

    @Test
    fun `should drop a re-export whose target is not in the analyzed set`() {
        // Given — domain re-exports Workshop, but workshop.rs is NOT among the analyzed files
        val domainLib = analyze("pub use workshop::Workshop;", "/repo/crates/domain/src/lib.rs")
        val consumer = analyze(
            """
            use domain::Workshop;
            pub fn render(w: &Workshop) -> String { String::new() }
            """.trimIndent(),
            "/repo/crates/adapter_exporter/src/markdown.rs"
        )

        // When
        val resolved = DependencyResolverService.resolveNodes(listOf(domainLib, consumer))

        // Then — with no real definition to alias onto, the carrier is dropped and render stays unresolved
        assertThat(resolved.map { it.pathWithName.withDots() }).doesNotContain("domain.Workshop")
        val render = resolved.first { it.pathWithName.parts.last() == "render" }
        assertThat(render.resolvedNodeDependencies.internalDependencies).isEmpty()
    }
}
