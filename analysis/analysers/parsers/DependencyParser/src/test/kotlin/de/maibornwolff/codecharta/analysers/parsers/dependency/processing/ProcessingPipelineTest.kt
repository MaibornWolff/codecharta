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
    fun `should address both ends of every declaration edge by a declaration it lists`() {
        // Act
        val graph = graphOfJavaSample()

        // Assert
        val addresses = graph.declarations.map { it.address }
        assertThat(graph.declarationEdges).isNotEmpty
        assertThat(graph.declarationEdges).allSatisfy { edge ->
            assertThat(addresses).contains(edge.from, edge.to)
            assertThat(edge.weight).isGreaterThanOrEqualTo(1)
        }
    }

    @Test
    fun `should record every declaration with its file, a lower-case kind and its language`() {
        // Act
        val graph = graphOfJavaSample()

        // Assert
        assertThat(graph.declarations).isNotEmpty
        assertThat(graph.declarations).allSatisfy { declaration ->
            assertThat(declaration.address.filePath.last()).endsWith(".java")
            assertThat(declaration.address.key).isEqualTo(declaration.name)
            assertThat(declaration.kind).isLowerCase()
            assertThat(declaration.language).isEqualTo("java")
        }
    }

    @Test
    fun `should give every key at most one declaration per file`() {
        // Arrange
        val extracted = extractFrom(javaSample, SupportedLanguage.JAVA)

        // Act
        val graph = ProcessingPipeline.run(extracted, omitGraphAnalysis = false)

        // Assert
        assertThat(graph.declarations.map { it.address }).doesNotHaveDuplicates()
    }

    @Test
    fun `should assign a level to every declaration and to every namespace above it`() {
        // Act
        val graph = graphOfJavaSample()

        // Assert
        assertThat(graph.declarations).allSatisfy { declaration -> assertThat(declaration.level).isNotNull() }
        assertThat(graph.namespaces).isNotEmpty
        assertThat(graph.namespaces.values).allSatisfy { namespace -> assertThat(namespace.level).isGreaterThanOrEqualTo(0) }
    }

    @Test
    fun `should put a declaration of a package language into the package it declares`() {
        // Arrange
        File(sampleDirectory, "Creature.java").writeText("package de.sots.domain;\n\npublic class Creature {}\n")

        // Act
        val graph = ProcessingPipeline.run(extractFrom(sampleDirectory.path, SupportedLanguage.JAVA), omitGraphAnalysis = false)

        // Assert
        assertThat(graph.declarations.single().namespace).isEqualTo("de.sots.domain")
    }

    @Test
    fun `should link every namespace to the one containing it and leave the outermost without a parent`() {
        // Arrange
        File(sampleDirectory, "Creature.java").writeText("package de.sots.domain;\n\npublic class Creature {}\n")

        // Act
        val graph = ProcessingPipeline.run(extractFrom(sampleDirectory.path, SupportedLanguage.JAVA), omitGraphAnalysis = false)

        // Assert
        assertThat(graph.namespaces.mapValues { it.value.parent })
            .containsExactlyInAnyOrderEntriesOf(mapOf("de" to null, "de.sots" to "de", "de.sots.domain" to "de.sots"))
    }

    @Test
    fun `should emit no namespace for a language whose logical path is its file path`() {
        // Arrange
        File(sampleDirectory, "creature.ts").writeText("export class Creature {}\n")
        File(sampleDirectory, "dragon.ts").writeText("import { Creature } from './creature'\nexport class Dragon extends Creature {}\n")

        // Act
        val graph = ProcessingPipeline.run(extractFrom(sampleDirectory.path, SupportedLanguage.TYPESCRIPT), omitGraphAnalysis = false)

        // Assert
        assertThat(graph.declarations.map { it.address.key }).containsExactlyInAnyOrder("Creature", "Dragon")
        assertThat(graph.declarations).allSatisfy { declaration -> assertThat(declaration.namespace).isNull() }
        assertThat(graph.namespaces).isEmpty()
        assertThat(graph.declarationEdges).hasSize(1)
    }

    @Test
    fun `should emit no namespace for a file of a package language that declares none`() {
        // Arrange
        File(sampleDirectory, "plain.php").writeText("<?php\nclass Plain {}\n")

        // Act
        val graph = ProcessingPipeline.run(extractFrom(sampleDirectory.path, SupportedLanguage.PHP), omitGraphAnalysis = false)

        // Assert
        assertThat(graph.declarations.single().namespace).isNull()
        assertThat(graph.namespaces).isEmpty()
    }

    @Test
    fun `should emit no namespace for a language whose package path is the directory of the file`() {
        // Arrange
        val packageDirectory = File(sampleDirectory, "util").apply { mkdirs() }
        File(packageDirectory, "helper.go").writeText("package util\n\ntype Helper struct{}\n")

        // Act
        val graph = ProcessingPipeline.run(extractFrom(sampleDirectory.path, SupportedLanguage.GO), omitGraphAnalysis = false)

        // Assert
        assertThat(graph.declarations).isNotEmpty
        assertThat(graph.declarations).allSatisfy { declaration -> assertThat(declaration.namespace).isNull() }
        assertThat(graph.namespaces).isEmpty()
    }

    @Test
    fun `should put a nested declaration into the package of the declaration enclosing it`() {
        // Arrange
        File(sampleDirectory, "Outer.kt").writeText("package de.sots\n\nclass Outer {\n    class Inner\n}\n")

        // Act
        val graph = ProcessingPipeline.run(extractFrom(sampleDirectory.path, SupportedLanguage.KOTLIN), omitGraphAnalysis = false)

        // Assert
        assertThat(graph.declarations.map { it.address.key to it.namespace }).containsExactlyInAnyOrder(
            "Outer" to "de.sots",
            "Inner" to "de.sots"
        )
        assertThat(graph.namespaces.keys).containsExactlyInAnyOrder("de", "de.sots")
    }

    @Test
    fun `should key two declarations of one file that share a name by their logical paths`() {
        // Arrange: one file, two namespaces, the same class name in both.
        File(
            sampleDirectory,
            "Shapes.cs"
        ).writeText("namespace First { public class Shape { } }\nnamespace Second { public class Shape { } }\n")

        // Act
        val graph = ProcessingPipeline.run(extractFrom(sampleDirectory.path, SupportedLanguage.C_SHARP), omitGraphAnalysis = false)

        // Assert
        assertThat(graph.declarations.map { it.address.key }).containsExactlyInAnyOrder("First.Shape", "Second.Shape")
        assertThat(graph.declarations.map { it.name }).containsOnly("Shape")
        assertThat(graph.declarations.map { it.namespace }).containsExactlyInAnyOrder("First", "Second")
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
        val filePairsWithAnEdge = graph.edges.map { it.fromPath to it.toPath }.toSet()

        // Act
        val crossFileLeafEdges = graph.declarationEdges
            .map { it.from.filePath to it.to.filePath }
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
        val file = listOf("Outer.java")
        assertThat(graph.declarationEdges.map { it.from to it.to })
            .containsExactly(DeclarationAddress(file, "Outer") to DeclarationAddress(file, "Inner"))
        assertThat(graph.edges).isEmpty()
    }

    @Test
    fun `should emit one declaration per file of a split declaration and point edges into it at the first`() {
        // Arrange: a partial class in two files, and a class that depends on it.
        File(sampleDirectory, "FooA.cs").writeText("namespace N { public partial class Foo { private Bar bar; } }")
        File(sampleDirectory, "FooB.cs").writeText("namespace N { public partial class Foo { } }")
        File(sampleDirectory, "Bar.cs").writeText("namespace N { public class Bar { private Foo foo; } }")

        // Act
        val graph = ProcessingPipeline.run(extractFrom(sampleDirectory.path, SupportedLanguage.C_SHARP), omitGraphAnalysis = false)

        // Assert: both parts share namespace and key, and both projections point Bar at the first part.
        val fooA = DeclarationAddress(listOf("FooA.cs"), "Foo")
        val parts = graph.declarations.filter { it.name == "Foo" }
        assertThat(parts.map { it.address }).containsExactly(fooA, DeclarationAddress(listOf("FooB.cs"), "Foo"))
        assertThat(parts.map { it.namespace }).containsOnly("N")
        val bar = DeclarationAddress(listOf("Bar.cs"), "Bar")
        assertThat(graph.declarationEdges.map { it.from to it.to }).containsExactlyInAnyOrder(bar to fooA, fooA to bar)
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

        // Assert: one leaf, in the source file (first in path order), keeping the source half's dependency.
        val myType = DeclarationAddress(listOf("cpp", "example", "MyType.cpp"), "MyType")
        assertThat(graph.declarations.map { it.address }).containsExactlyInAnyOrder(
            DeclarationAddress(listOf("cpp", "example", "Root.cpp"), "Root"),
            myType,
            DeclarationAddress(listOf("cpp", "different", "UsedType.h"), "UsedType")
        )
        assertThat(graph.declarationEdges.map { it.from to it.to })
            .contains(myType to DeclarationAddress(listOf("cpp", "different", "UsedType.h"), "UsedType"))
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
        assertThat(graph.declarations).allSatisfy { declaration ->
            assertThat(declaration.level).isNull()
            assertThat(declaration.namespace).isNull()
        }
        assertThat(graph.namespaces).isEmpty()
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
        assertThat(second.namespaces).isEqualTo(first.namespaces)
    }
}
