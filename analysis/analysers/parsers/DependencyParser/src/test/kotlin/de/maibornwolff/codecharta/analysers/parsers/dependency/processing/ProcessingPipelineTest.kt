package de.maibornwolff.codecharta.analysers.parsers.dependency.processing

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.extractFrom
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Dependency
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileReport
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Node
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.NodeType
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Type
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import java.io.File

/**
 * Drives the whole processing chain over the "cellars and centaurs" sample, the same one the extraction
 * contract tests use. The Java version of the sample carries a layering violation and a cycle, so it
 * exercises every edge type the lens can carry.
 */
class ProcessingPipelineTest {
    @TempDir
    lateinit var sampleDirectory: File

    private val javaSample = "src/test/resources/analysis/contract/examples/java"

    private fun graphOfJavaSample(omitGraphAnalysis: Boolean = false): DependencyGraph =
        ProcessingPipeline.run(extractFrom(javaSample, SupportedLanguage.JAVA), omitGraphAnalysis)

    @Test
    fun `should produce file-to-file edges addressed by path segments`() {
        // Act
        val graph = graphOfJavaSample()

        // Assert
        assertThat(graph.edges).isNotEmpty
        assertThat(graph.edges).allSatisfy { edge ->
            assertThat(edge.fromPath.last()).endsWith(".java")
            assertThat(edge.toPath.last()).endsWith(".java")
            assertThat(edge.fromPath).isNotEqualTo(edge.toPath)
        }
    }

    @Test
    fun `should give every edge a weight of at least one`() {
        // Act
        val graph = graphOfJavaSample()

        // Assert
        assertThat(graph.edges).allSatisfy { edge -> assertThat(edge.weight).isGreaterThanOrEqualTo(1) }
    }

    @Test
    fun `should find cyclic edges in a sample that contains a cycle`() {
        // Act
        val graph = graphOfJavaSample()

        // Assert
        assertThat(graph.edges.filter { it.isCyclic }).isNotEmpty
    }

    @Test
    fun `should find upward-pointing edges in a sample that violates its layering`() {
        // Act
        val graph = graphOfJavaSample()

        // Assert
        assertThat(graph.edges.filter { it.isPointingUpwards }).isNotEmpty
    }

    @Test
    fun `should assign a level to every file and to every folder above it`() {
        // Act
        val graph = graphOfJavaSample()

        // Assert
        assertThat(graph.levels).isNotEmpty
        assertThat(graph.levels).allSatisfy { levelized -> assertThat(levelized.level).isGreaterThanOrEqualTo(0) }
        assertThat(graph.levels.filter { it.isFile }).isNotEmpty
        assertThat(graph.levels.filter { !it.isFile }).isNotEmpty
    }

    @Test
    fun `should level a file that depends on nothing at zero`() {
        // Act
        val graph = graphOfJavaSample()
        val filesWithoutOutgoingEdges =
            graph.levels.filter { it.isFile && graph.edges.none { edge -> edge.fromPath == it.path } }

        // Assert
        assertThat(filesWithoutOutgoingEdges).isNotEmpty
        assertThat(filesWithoutOutgoingEdges).allSatisfy { levelized -> assertThat(levelized.level).isEqualTo(0) }
    }

    @Test
    fun `should produce declaration-to-declaration edges addressed by dotted logical path`() {
        // Act
        val graph = graphOfJavaSample()

        // Assert
        val declarationIds = graph.declarations.map { it.id }
        assertThat(graph.declarationEdges).isNotEmpty
        assertThat(graph.declarationEdges).allSatisfy { edge ->
            assertThat(declarationIds).contains(edge.fromId, edge.toId)
            assertThat(edge.weight).isGreaterThanOrEqualTo(1)
        }
    }

    @Test
    fun `should record every declaration with the file it was declared in`() {
        // Act
        val graph = graphOfJavaSample()

        // Assert
        assertThat(graph.declarations).isNotEmpty
        assertThat(graph.declarations).allSatisfy { declaration ->
            assertThat(declaration.filePath.last()).endsWith(".java")
            assertThat(declaration.name).isNotEmpty()
            assertThat(declaration.kind).isNotEmpty()
        }
    }

    @Test
    fun `should assign a level to every declaration and to every namespace above it`() {
        // Act
        val graph = graphOfJavaSample()

        // Assert
        assertThat(graph.declarations).allSatisfy { declaration -> assertThat(declaration.level).isNotNull() }
        assertThat(graph.namespaceLevels).isNotEmpty
        assertThat(graph.namespaceLevels.values).allSatisfy { level -> assertThat(level).isGreaterThanOrEqualTo(0) }
    }

    @Test
    fun `should find cyclic and upward-pointing edges at declaration level too`() {
        // Act
        val graph = graphOfJavaSample()

        // Assert
        assertThat(graph.declarationEdges.filter { it.isCyclic }).isNotEmpty
        assertThat(graph.declarationEdges.filter { it.isPointingUpwards }).isNotEmpty
    }

    @Test
    fun `should record how each declaration uses the one it depends on`() {
        // Act
        val graph = graphOfJavaSample()

        // Assert
        assertThat(graph.declarationEdges).allSatisfy { edge -> assertThat(edge.usage).isNotEmpty() }
    }

    @Test
    fun `should carry all four edge types at declaration level`() {
        // Act
        val graph = graphOfJavaSample()

        // Assert: regular, cyclic, container-level feedback and leaf-level feedback all occur in the sample.
        val edgeTypes = graph.declarationEdges.map { it.isCyclic to it.isPointingUpwards }.toSet()
        assertThat(edgeTypes).containsExactlyInAnyOrder(false to false, true to false, false to true, true to true)
    }

    @Test
    fun `should agree with the file-level projection on every edge that crosses a file boundary`() {
        // Arrange
        val graph = graphOfJavaSample()
        val fileByDeclaration = graph.declarations.associate { it.id to it.filePath }
        val filePairsWithAnEdge = graph.edges.map { it.fromPath to it.toPath }.toSet()

        // Act
        val crossFileLeafEdges = graph.declarationEdges
            .map { fileByDeclaration.getValue(it.fromId) to fileByDeclaration.getValue(it.toId) }
            .filter { (fromFile, toFile) -> fromFile != toFile }

        // Assert: the file graph is the leaf graph folded onto files, so it can lose only the edges
        // between two declarations of one file.
        assertThat(crossFileLeafEdges).isNotEmpty
        assertThat(filePairsWithAnEdge).containsAll(crossFileLeafEdges)
    }

    @Test
    fun `should keep an edge between two declarations of one file that the file projection cannot carry`() {
        // Arrange: two classes in one file, one using the other. This is the signal the physical view loses.
        val source =
            """
            package de.sots;

            public class Outer {
                private Inner inner = new Inner();
            }

            class Inner {
            }
            """.trimIndent()
        File(sampleDirectory, "Outer.java").writeText(source)

        // Act
        val graph = ProcessingPipeline.run(extractFrom(sampleDirectory.path, SupportedLanguage.JAVA), omitGraphAnalysis = false)

        // Assert
        assertThat(graph.declarationEdges.map { it.fromId to it.toId }).contains("de.sots.Outer" to "de.sots.Inner")
        assertThat(graph.edges).isEmpty()
    }

    @Test
    fun `should join a declaration split across files to the same file in both projections`() {
        // Arrange: a partial class in two files, and a class that depends on it.
        File(sampleDirectory, "FooA.cs").writeText("namespace N { public partial class Foo { private Bar bar; } }")
        File(sampleDirectory, "FooB.cs").writeText("namespace N { public partial class Foo { } }")
        File(sampleDirectory, "Bar.cs").writeText("namespace N { public class Bar { private Foo foo; } }")

        // Act
        val graph = ProcessingPipeline.run(extractFrom(sampleDirectory.path, SupportedLanguage.C_SHARP), omitGraphAnalysis = false)

        // Assert: the leaf joins to FooA.cs, and so does every file edge that targets Foo.
        val foo = graph.declarations.single { it.id == "N.Foo" }
        assertThat(foo.filePath).containsExactly("FooA.cs")
        val edgesIntoFoo = graph.edges.filter { it.fromPath == listOf("Bar.cs") }
        assertThat(edgesIntoFoo).extracting("toPath").containsExactly(listOf("FooA.cs"))
        assertThat(graph.edges.map { it.fromPath to it.toPath }).contains(listOf("FooA.cs") to listOf("Bar.cs"))
    }

    @Test
    fun `should fold a C++ type declared in a header and defined in a source file into one declaration`() {
        // Arrange: MyType arrives twice, once per translation unit; only the source half uses UsedType.
        val root = cppNode("cpp/example/Root", "cpp/example/Root.cpp", usedTypes = setOf(Type.simple("MyType")))
        val definition =
            cppNode(
                "cpp/example/MyType",
                "cpp/example/MyType.cpp",
                dependencies = setOf(Dependency.simple("cpp", "different", "UsedType_h")),
                usedTypes = setOf(Type.simple("UsedType"))
            )
        val declaration = cppNode("cpp/example/MyType", "cpp/example/MyType.h")
        val usedType = cppNode("cpp/different/UsedType", "cpp/different/UsedType.h")
        val fileReports = listOf(FileReport(listOf(root, definition)), FileReport(listOf(declaration, usedType)))

        // Act
        val graph = ProcessingPipeline.run(fileReports, omitGraphAnalysis = false)

        // Assert: one leaf, joined to the source file (first in path order), keeping the source half's dependency.
        assertThat(
            graph.declarations.map { it.id }
        ).containsExactlyInAnyOrder("cpp.example.Root", "cpp.example.MyType", "cpp.different.UsedType")
        assertThat(graph.declarations.single { it.id == "cpp.example.MyType" }.filePath).containsExactly("cpp", "example", "MyType.cpp")
        assertThat(graph.declarationEdges.map { it.fromId to it.toId }).contains("cpp.example.MyType" to "cpp.different.UsedType")
        assertThat(graph.edges.map { it.fromPath to it.toPath })
            .doesNotContain(listOf("cpp", "example", "MyType.cpp") to listOf("cpp", "example", "MyType.h"))
    }

    @Test
    fun `should drop an edge from a declaration to itself`() {
        // Arrange: a class that names itself, e.g. a builder returning its own type.
        val source =
            """
            package de.sots;

            public class Builder {
                public Builder with() { return this; }
            }
            """.trimIndent()
        File(sampleDirectory, "Builder.java").writeText(source)

        // Act
        val graph = ProcessingPipeline.run(extractFrom(sampleDirectory.path, SupportedLanguage.JAVA), omitGraphAnalysis = false)

        // Assert
        assertThat(graph.declarationEdges).isEmpty()
        assertThat(graph.edges).isEmpty()
    }

    @Test
    fun `should weigh a declaration that uses one target in several ways once, as DependaCharta does`() {
        // Arrange: PHP is the one language that tells usage kinds apart, so it is where the weights could drift.
        File(sampleDirectory, "Base.php").writeText(
            """
            <?php
            namespace App;
            class Base {}
            """.trimIndent()
        )
        File(sampleDirectory, "Child.php").writeText(
            """
            <?php
            namespace App;
            class Child extends Base {
                public function make(): Base { return new Base(); }
            }
            """.trimIndent()
        )

        // Act
        val graph = ProcessingPipeline.run(extractFrom(sampleDirectory.path, SupportedLanguage.PHP), omitGraphAnalysis = false)

        // Assert: one dependency of weight one in both projections. A used type is identified by name alone,
        // so the pair keeps the first usage kind the extractor found rather than all three.
        assertThat(graph.declarationEdges).hasSize(1)
        assertThat(graph.declarationEdges.single().weight).isEqualTo(1)
        assertThat(graph.declarationEdges.single().usage).hasSize(1)
        assertThat(graph.edges).hasSize(1)
        assertThat(graph.edges.single().weight).isEqualTo(1)
    }

    private fun cppNode(
        pathWithName: String,
        physicalPath: String,
        dependencies: Set<Dependency> = emptySet(),
        usedTypes: Set<Type> = emptySet()
    ) = Node(
        pathWithName = Path.fromPhysicalPath(pathWithName).withAlias(Path.fromPhysicalPath(physicalPath)),
        physicalPath = physicalPath,
        nodeType = NodeType.CLASS,
        language = SupportedLanguage.CPP,
        dependencies = dependencies,
        usedTypes = usedTypes
    )

    @Test
    fun `should keep the dependencies but skip cycles and levels when graph analysis is omitted`() {
        // Act
        val graph = graphOfJavaSample(omitGraphAnalysis = true)

        // Assert: both projections lose their flags and levels, since both levelizations are skipped.
        assertThat(graph.edges).isNotEmpty
        assertThat(graph.edges).allSatisfy { edge ->
            assertThat(edge.isCyclic).isFalse()
            assertThat(edge.isPointingUpwards).isFalse()
        }
        assertThat(graph.levels).isEmpty()
        assertThat(graph.declarationEdges).isNotEmpty
        assertThat(graph.declarationEdges).allSatisfy { edge ->
            assertThat(edge.isCyclic).isFalse()
            assertThat(edge.isPointingUpwards).isFalse()
        }
        assertThat(graph.declarations).allSatisfy { declaration -> assertThat(declaration.level).isNull() }
        assertThat(graph.namespaceLevels).isEmpty()
    }

    @Test
    fun `should produce an empty graph when nothing was extracted`() {
        // Act
        val graph = ProcessingPipeline.run(emptyList(), omitGraphAnalysis = false)

        // Assert
        assertThat(graph.edges).isEmpty()
        assertThat(graph.levels).isEmpty()
        assertThat(graph.declarations).isEmpty()
        assertThat(graph.declarationEdges).isEmpty()
    }

    @Test
    fun `should produce an empty graph when every file report is empty`() {
        // Act
        val graph = ProcessingPipeline.run(listOf(FileReport(emptyList())), omitGraphAnalysis = false)

        // Assert
        assertThat(graph.edges).isEmpty()
        assertThat(graph.levels).isEmpty()
    }

    @Test
    fun `should be deterministic across runs`() {
        // Arrange: levels and cycles both drive rendering, so a rerun must not shuffle them.
        val first = graphOfJavaSample()

        // Act
        val second = graphOfJavaSample()

        // Assert
        assertThat(second.edges).isEqualTo(first.edges)
        assertThat(second.levels).isEqualTo(first.levels)
        assertThat(second.declarations).isEqualTo(first.declarations)
        assertThat(second.declarationEdges).isEqualTo(first.declarationEdges)
        assertThat(second.namespaceLevels).isEqualTo(first.namespaceLevels)
    }
}
