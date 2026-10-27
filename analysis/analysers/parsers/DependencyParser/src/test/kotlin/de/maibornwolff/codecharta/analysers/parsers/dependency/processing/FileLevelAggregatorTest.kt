package de.maibornwolff.codecharta.analysers.parsers.dependency.processing

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Dependency
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FilePath
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Node
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.NodeDependencies
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.NodeType
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class FileLevelAggregatorTest {
    private fun declaration(
        name: String,
        file: String,
        dependsOn: List<String> = emptyList(),
        language: SupportedLanguage = SupportedLanguage.KOTLIN,
        isFileScoped: Boolean = false
    ) = Node(
        pathWithName = Path.fromStringWithDots(name),
        physicalPath = file,
        nodeType = NodeType.CLASS,
        language = language,
        dependencies = emptySet(),
        usedTypes = emptySet(),
        resolvedNodeDependencies =
            NodeDependencies(
                internalDependencies = dependsOn.map { Dependency(Path.fromStringWithDots(it)) }.toSet(),
                externalDependencies = emptySet()
            ),
        isFileScoped = isFileScoped
    )

    @Test
    fun `should sum the weights of the declaration edges behind one file-to-file edge`() {
        // Arrange: two classes in one file, each depending on a class in the same other file.
        val nodes =
            listOf(
                declaration("app.First", "app/Source.kt", listOf("app.Target")),
                declaration("app.Second", "app/Source.kt", listOf("app.Target")),
                declaration("app.Target", "app/Target.kt")
            )

        // Act
        val edges = FileLevelAggregator.aggregate(nodes, emptyMap())

        // Assert
        assertThat(edges).hasSize(1)
        assertThat(edges.single().weight).isEqualTo(2)
        assertThat(edges.single().from.segments).containsExactly("app", "Source.kt")
        assertThat(edges.single().to.segments).containsExactly("app", "Target.kt")
    }

    @Test
    fun `should mark a file edge cyclic when any declaration edge behind it is cyclic`() {
        // Arrange: only the second class takes part in a cycle.
        val nodes =
            listOf(
                declaration("app.First", "app/Source.kt", listOf("app.Target")),
                declaration("app.Second", "app/Source.kt", listOf("app.Target")),
                declaration("app.Target", "app/Target.kt")
            )
        val cyclicEdges = mapOf("app.Second" to setOf("app.Target"))

        // Act
        val edges = FileLevelAggregator.aggregate(nodes, cyclicEdges)

        // Assert
        assertThat(edges.single().isCyclic).isTrue()
    }

    @Test
    fun `should leave a file edge non-cyclic when no declaration edge behind it is cyclic`() {
        // Arrange
        val nodes = listOf(declaration("app.First", "app/Source.kt", listOf("app.Target")), declaration("app.Target", "app/Target.kt"))

        // Act
        val edges = FileLevelAggregator.aggregate(nodes, mapOf("app.First" to setOf("app.Other")))

        // Assert
        assertThat(edges.single().isCyclic).isFalse()
    }

    @Test
    fun `should drop an edge between two declarations that live in the same file`() {
        // Arrange: a file cannot depend on itself.
        val nodes =
            listOf(
                declaration("app.First", "app/Source.kt", listOf("app.Second")),
                declaration("app.Second", "app/Source.kt")
            )

        // Act
        val edges = FileLevelAggregator.aggregate(nodes, emptyMap())

        // Assert
        assertThat(edges).isEmpty()
    }

    @Test
    fun `should point a dependency on a file-scoped copy only at the copy in the using file`() {
        // Arrange: two files of one folder each declare their own private app.Helper.
        val nodes =
            listOf(
                declaration("app.First", "app/First.kt", listOf("app.Helper")),
                declaration("app.Helper", "app/First.kt", isFileScoped = true),
                declaration("app.Second", "app/Second.kt", listOf("app.Helper")),
                declaration("app.Helper", "app/Second.kt", isFileScoped = true),
                declaration("app.Third", "app/Third.kt", listOf("app.Helper"))
            )

        // Act
        val edges = FileLevelAggregator.aggregate(nodes, emptyMap())

        // Assert
        assertThat(edges).isEmpty()
    }

    @Test
    fun `should drop a dependency on a declaration no analyzer produced`() {
        // Arrange: nothing declares app.Ghost, so there is no file for the edge to point at.
        val nodes = listOf(declaration("app.First", "app/Source.kt", listOf("app.Ghost")))

        // Act
        val edges = FileLevelAggregator.aggregate(nodes, emptyMap())

        // Assert
        assertThat(edges).isEmpty()
    }

    @Test
    fun `should keep both directions of a mutual dependency as separate edges`() {
        // Arrange
        val nodes =
            listOf(
                declaration("app.First", "app/First.kt", listOf("app.Second")),
                declaration("app.Second", "app/Second.kt", listOf("app.First"))
            )

        // Act
        val edges = FileLevelAggregator.aggregate(nodes, emptyMap())

        // Assert
        assertThat(edges).hasSize(2)
        assertThat(edges.map { it.from.segments.last() }).containsExactlyInAnyOrder("First.kt", "Second.kt")
    }

    @Test
    fun `should address a file by its path segments, with the dots inside a segment escaped for the graph`() {
        // Arrange
        val nodes = listOf(declaration("app.First", "src/app/First.kt", listOf("app.Target")), declaration("app.Target", "src/T.kt"))

        // Act
        val edge = FileLevelAggregator.aggregate(nodes, emptyMap()).single()

        // Assert: the tree keeps the real name; the graph id escapes the extension dot so its
        // dot-joined ids still split on namespace boundaries.
        assertThat(edge.from.segments).containsExactly("src", "app", "First.kt")
        assertThat(edge.from.graphId).isEqualTo("src.app.First_kt")
    }

    @Test
    fun `should count a split declaration's dependencies for the file each part is written in`() {
        // Arrange: a partial class whose second part holds the only reference to Bar.
        val nodes =
            listOf(
                declaration("app.Foo", "app/FooA.kt"),
                declaration("app.Foo", "app/FooB.kt", listOf("app.Bar")),
                declaration("app.Bar", "app/Bar.kt")
            )

        // Act
        val edges = FileLevelAggregator.aggregate(nodes, emptyMap())

        // Assert
        assertThat(edges.single().from.segments).containsExactly("app", "FooB.kt")
    }

    @Test
    fun `should point a dependency on a split declaration at the first file, the one the logical layer joins it to`() {
        // Arrange
        val nodes =
            listOf(
                declaration("app.Foo", "app/FooA.kt"),
                declaration("app.Foo", "app/FooB.kt"),
                declaration("app.Bar", "app/Bar.kt", listOf("app.Foo"))
            )

        // Act
        val edges = FileLevelAggregator.aggregate(nodes, emptyMap())

        // Assert
        assertThat(edges.single().to.segments).containsExactly("app", "FooA.kt")
    }

    @Test
    fun `should point a dependency on a logical path declared in several folders at the file nearest to the using file`() {
        // Arrange: two projects declare app.Config, the using file lies in the second one.
        val nodes =
            listOf(
                declaration("app.Config", "a/app/Config.kt"),
                declaration("app.Config", "b/app/Config.kt"),
                declaration("app.App", "b/app/App.kt", listOf("app.Config"))
            )

        // Act
        val edges = FileLevelAggregator.aggregate(nodes, emptyMap())

        // Assert
        assertThat(edges.single().to.segments).containsExactly("b", "app", "Config.kt")
    }

    @Test
    fun `should point a dependency on a C# declaration in several files of one project at every file`() {
        // Arrange: a partial class in two files of one project.
        val nodes =
            listOf(
                declaration("Shop.Order", "Gen/Order.g.cs", language = SupportedLanguage.C_SHARP),
                declaration("Shop.Order", "Model/Order.cs", language = SupportedLanguage.C_SHARP),
                declaration("Shop.Use", "Model/Use.cs", listOf("Shop.Order"), SupportedLanguage.C_SHARP)
            )

        // Act
        val edges = FileLevelAggregator.aggregate(nodes, emptyMap())

        // Assert
        assertThat(edges.map { it.to.segments }).containsExactlyInAnyOrder(listOf("Gen", "Order.g.cs"), listOf("Model", "Order.cs"))
    }

    @Test
    fun `should point a Java dependency at the nearest Java copy although a C# file declares the same path`() {
        // Arrange
        val nodes =
            listOf(
                declaration("a.Config", "far/a/Config.java", language = SupportedLanguage.JAVA),
                declaration("a.Config", "cs/a/Config.cs", language = SupportedLanguage.C_SHARP),
                declaration("a.Config", "near/a/Config.java", language = SupportedLanguage.JAVA),
                declaration("a.App", "near/a/App.java", listOf("a.Config"), SupportedLanguage.JAVA)
            )

        // Act
        val edges = FileLevelAggregator.aggregate(nodes, emptyMap())

        // Assert
        assertThat(edges.single().to.segments).containsExactly("near", "a", "Config.java")
    }

    @Test
    fun `should point a dependency only at a copy declared in a language of the using file's name scope`() {
        // Arrange: a C++ header nearer to the Java file declares the same logical path as a Java class.
        val nodes =
            listOf(
                declaration("a.Widget", "lib/a/Widget.java", language = SupportedLanguage.JAVA),
                declaration("a.Widget", "app/a/widget.hpp", language = SupportedLanguage.CPP),
                declaration("a.App", "app/a/App.java", listOf("a.Widget"), SupportedLanguage.JAVA)
            )

        // Act
        val edges = FileLevelAggregator.aggregate(nodes, emptyMap())

        // Assert
        assertThat(edges.single().to.segments).containsExactly("lib", "a", "Widget.java")
    }

    @Test
    fun `should point a dependency on a SQL object created in several files at the last file, the latest migration`() {
        // Arrange
        val nodes =
            listOf(
                declaration("orders", "db/V1__orders.sql", language = SupportedLanguage.SQL),
                declaration("orders", "db/V2__orders.sql", language = SupportedLanguage.SQL),
                declaration("report", "db/report.sql", listOf("orders"), SupportedLanguage.SQL)
            )

        // Act
        val edges = FileLevelAggregator.aggregate(nodes, emptyMap())

        // Assert
        assertThat(edges.single().to.segments).containsExactly("db", "V2__orders.sql")
    }

    @Test
    fun `should order migrations by the numbers in their names, so that V10 comes after V9`() {
        // Arrange
        val nodes =
            listOf(
                declaration("orders", "db/V10__orders.sql", language = SupportedLanguage.SQL),
                declaration("orders", "db/V9__orders.sql", language = SupportedLanguage.SQL)
            )

        // Act
        val filePaths = DeclaringFiles.of(nodes).filesFor("orders", FilePath(listOf("db", "report.sql")), SupportedLanguage.SQL)

        // Assert
        assertThat(filePaths).containsExactly(FilePath(listOf("db", "V10__orders.sql")))
    }

    @Test
    fun `should point a dependency that can mean some kinds of declaration only at the copies of these kinds`() {
        // Arrange
        val nodes =
            listOf(
                declaration("audit", "db/a_function.sql", language = SupportedLanguage.SQL).copy(kind = "routine"),
                declaration("audit", "db/z_table.sql", language = SupportedLanguage.SQL).copy(kind = "table")
            )

        // Act
        val filePaths = DeclaringFiles
            .of(nodes)
            .filesFor("audit", FilePath(listOf("db", "report.sql")), SupportedLanguage.SQL, setOf("routine"))

        // Assert
        assertThat(filePaths).containsExactly(FilePath(listOf("db", "a_function.sql")))
    }

    @Test
    fun `should point a dependency at every copy as the copy rules pick them when no copy is of its kinds`() {
        // Arrange
        val nodes =
            listOf(
                declaration("audit", "db/a_function.sql", language = SupportedLanguage.SQL).copy(kind = "routine"),
                declaration("audit", "db/z_table.sql", language = SupportedLanguage.SQL).copy(kind = "table")
            )

        // Act
        val filePaths = DeclaringFiles
            .of(nodes)
            .filesFor("audit", FilePath(listOf("db", "report.sql")), SupportedLanguage.SQL, setOf("sequence"))

        // Assert
        assertThat(filePaths).containsExactly(FilePath(listOf("db", "z_table.sql")))
    }

    @Test
    fun `should point a SQL dependency from an implementation part's own file at the declaration, not at the later part`() {
        // Arrange
        val nodes =
            listOf(
                declaration("point_t", "db/point_t.sql", language = SupportedLanguage.SQL),
                declaration("point_t", "db/point_t_body.sql", language = SupportedLanguage.SQL, isFileScoped = true)
            )

        // Act
        val filePaths = DeclaringFiles.of(nodes).filesFor("point_t", FilePath(listOf("db", "point_t_body.sql")), SupportedLanguage.SQL)

        // Assert
        assertThat(filePaths).containsExactly(FilePath(listOf("db", "point_t.sql")))
    }
}
