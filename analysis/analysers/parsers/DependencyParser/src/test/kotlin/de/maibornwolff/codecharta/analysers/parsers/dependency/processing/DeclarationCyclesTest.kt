package de.maibornwolff.codecharta.analysers.parsers.dependency.processing

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.extractFrom
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import java.io.File

class DeclarationCyclesTest {
    @TempDir
    lateinit var sampleDirectory: File

    private fun write(relativePath: String, content: String) {
        File(sampleDirectory, relativePath).apply { parentFile.mkdirs() }.writeText(content)
    }

    private fun graphOf(language: SupportedLanguage, reversed: Boolean = false): DependencyGraph {
        val fileReports = extractFrom(sampleDirectory.path, language)
        return ProcessingPipeline.run(if (reversed) fileReports.reversed() else fileReports, omitGraphAnalysis = false, sampleDirectory)
    }

    private fun cyclicEdgesOf(graph: DependencyGraph): List<String> = graph.declarationEdges
        .filter { it.isCyclic }
        .map { "${it.from.filePath.joinToString("/")} -> ${it.to.filePath.joinToString("/")}" }

    @Test
    fun `should find no cycle through two declarations that share a name in different files`() {
        // Arrange: one/p/A uses the nearer Foo, the Foo of two/p uses A.
        write("one/p/A.java", "package p;\npublic class A { Foo foo; }")
        write("one/p/Foo.java", "package p;\npublic class Foo { }")
        write("two/p/Foo.java", "package p;\npublic class Foo { A a; }")

        // Act
        val graphs = listOf(graphOf(SupportedLanguage.JAVA), graphOf(SupportedLanguage.JAVA, reversed = true))

        // Assert
        assertThat(graphs).allSatisfy { graph -> assertThat(cyclicEdgesOf(graph)).isEmpty() }
    }

    @Test
    fun `should find a cycle through the header and the source file of one C++ class`() {
        // Arrange
        write("foo.h", "class Foo { public: void run(); };")
        write("foo.cpp", "#include \"foo.h\"\n#include \"bar.h\"\nvoid Foo::run() { Bar bar; }")
        write("bar.h", "#include \"foo.h\"\nclass Bar { Foo* foo; };")

        // Act
        val graph = graphOf(SupportedLanguage.CPP)

        // Assert
        assertThat(cyclicEdgesOf(graph)).containsExactlyInAnyOrder("bar.h -> foo.h", "foo.cpp -> bar.h", "foo.cpp -> foo.h")
        assertThat(graph.cyclicEdgesWithoutWayBack()).isEmpty()
    }

    @Test
    fun `should find a cycle through a Rust type and its impl in another file`() {
        // Arrange
        write("Cargo.toml", "[package]\nname = \"demo\"\nversion = \"0.1.0\"\nedition = \"2021\"")
        write("src/lib.rs", "mod foo;\nmod foo_impl;\nmod bar;")
        write("src/foo.rs", "pub struct Foo;")
        write("src/foo_impl.rs", "use crate::foo::Foo;\nuse crate::bar::Bar;\nimpl Foo { pub fn run(&self) -> Bar { Bar { foo: None } } }")
        write("src/bar.rs", "use crate::foo::Foo;\npub struct Bar { pub foo: Option<Box<Foo>> }")

        // Act
        val graph = graphOf(SupportedLanguage.RUST)

        // Assert
        assertThat(cyclicEdgesOf(graph)).containsExactlyInAnyOrder(
            "src/bar.rs -> src/foo.rs",
            "src/foo_impl.rs -> src/bar.rs",
            "src/foo_impl.rs -> src/foo.rs"
        )
        assertThat(graph.cyclicEdgesWithoutWayBack()).isEmpty()
    }

    @Test
    fun `should give every cyclic edge of the Java sample a way back`() {
        // Act
        val graph = ProcessingPipeline.run(extractFrom(JAVA_SAMPLE, SupportedLanguage.JAVA), omitGraphAnalysis = false)

        // Assert
        assertThat(graph.declarationEdges.filter { it.isCyclic }).isNotEmpty
        assertThat(graph.cyclicEdgesWithoutWayBack()).isEmpty()
    }

    companion object {
        private const val JAVA_SAMPLE = "src/test/resources/analysis/contract/examples/java"
    }
}
