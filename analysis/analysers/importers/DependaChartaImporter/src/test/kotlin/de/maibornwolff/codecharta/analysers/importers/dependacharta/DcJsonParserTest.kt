package de.maibornwolff.codecharta.analysers.importers.dependacharta

import de.maibornwolff.codecharta.model.Path
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class DcJsonParserTest {
    @Test
    fun `should produce one file node for paths that canonicalize to the same position`() {
        val leaves = mapOf(
            "a" to DcLeaf(id = "a", name = "A", physicalPath = "src/./Foo.ts"),
            "b" to DcLeaf(id = "b", name = "B", physicalPath = "src/Foo.ts")
        )

        val nodes = DcJsonParser.parseFileNodes(DcProject(leaves = leaves))

        assertThat(nodes).hasSize(1)
        assertThat(nodes[0].first).isEqualTo(Path(listOf("src")))
        assertThat(nodes[0].second.name).isEqualTo("Foo.ts")
    }

    @Test
    fun `should split backslash separated physical paths into folders`() {
        val leaves = mapOf("a" to DcLeaf(id = "a", name = "A", physicalPath = "src\\sub\\Foo.ts"))

        val nodes = DcJsonParser.parseFileNodes(DcProject(leaves = leaves))

        assertThat(nodes).hasSize(1)
        assertThat(nodes[0].first).isEqualTo(Path(listOf("src", "sub")))
        assertThat(nodes[0].second.name).isEqualTo("Foo.ts")
    }

    @Test
    fun `should treat dot-normalized paths as the same file when filtering self edges`() {
        val leaves = mapOf(
            "a" to DcLeaf(id = "a", name = "A", physicalPath = "src/./Foo.ts", dependencies = mapOf("b" to DcDependency())),
            "b" to DcLeaf(id = "b", name = "B", physicalPath = "src/Foo.ts")
        )

        val edges = DcJsonParser.parseEdges(DcProject(leaves = leaves))

        assertThat(edges).isEmpty()
    }

    @Test
    fun `should create single edge for simple dependency`() {
        // Arrange
        val leaves = mapOf(
            "a.Foo" to DcLeaf(
                id = "a.Foo",
                name = "Foo",
                physicalPath = "src/Foo.ts",
                nodeType = "CLASS",
                language = "TypeScript",
                dependencies = mapOf(
                    "b.Bar" to DcDependency(weight = 1, type = "usage")
                )
            ),
            "b.Bar" to DcLeaf(
                id = "b.Bar",
                name = "Bar",
                physicalPath = "src/Bar.ts",
                nodeType = "CLASS",
                language = "TypeScript"
            )
        )
        val project = DcProject(leaves = leaves)

        // Act
        val edges = DcJsonParser.parseEdges(project)

        // Assert
        assertThat(edges).hasSize(1)
        assertThat(edges[0].fromNodeName).isEqualTo("/root/src/Foo.ts")
        assertThat(edges[0].toNodeName).isEqualTo("/root/src/Bar.ts")
        assertThat(edges[0].attributes["dependencies"]).isEqualTo(1)
    }

    @Test
    fun `should aggregate multiple class-to-class dependencies into single file-level edge`() {
        // Arrange
        val leaves = mapOf(
            "a.ClassA" to DcLeaf(
                id = "a.ClassA",
                name = "ClassA",
                physicalPath = "src/FileA.ts",
                nodeType = "CLASS",
                language = "TypeScript",
                dependencies = mapOf(
                    "b.ClassB" to DcDependency(weight = 1, type = "usage"),
                    "b.ClassC" to DcDependency(weight = 1, type = "usage")
                )
            ),
            "a.FuncD" to DcLeaf(
                id = "a.FuncD",
                name = "FuncD",
                physicalPath = "src/FileA.ts",
                nodeType = "FUNCTION",
                language = "TypeScript",
                dependencies = mapOf(
                    "b.ClassB" to DcDependency(weight = 1, type = "usage")
                )
            ),
            "b.ClassB" to DcLeaf(
                id = "b.ClassB",
                name = "ClassB",
                physicalPath = "src/FileB.ts",
                nodeType = "CLASS",
                language = "TypeScript"
            ),
            "b.ClassC" to DcLeaf(
                id = "b.ClassC",
                name = "ClassC",
                physicalPath = "src/FileB.ts",
                nodeType = "CLASS",
                language = "TypeScript"
            )
        )
        val project = DcProject(leaves = leaves)

        // Act
        val edges = DcJsonParser.parseEdges(project)

        // Assert
        assertThat(edges).hasSize(1)
        assertThat(edges[0].fromNodeName).isEqualTo("/root/src/FileA.ts")
        assertThat(edges[0].toNodeName).isEqualTo("/root/src/FileB.ts")
        assertThat(edges[0].attributes["dependencies"]).isEqualTo(3)
    }

    @Test
    fun `should skip self-referencing edges`() {
        // Arrange
        val leaves = mapOf(
            "a.Foo" to DcLeaf(
                id = "a.Foo",
                name = "Foo",
                physicalPath = "src/File.ts",
                nodeType = "CLASS",
                language = "TypeScript",
                dependencies = mapOf(
                    "a.Bar" to DcDependency(weight = 1, type = "usage")
                )
            ),
            "a.Bar" to DcLeaf(
                id = "a.Bar",
                name = "Bar",
                physicalPath = "src/File.ts",
                nodeType = "CLASS",
                language = "TypeScript"
            )
        )
        val project = DcProject(leaves = leaves)

        // Act
        val edges = DcJsonParser.parseEdges(project)

        // Assert
        assertThat(edges).isEmpty()
    }

    @Test
    fun `should handle missing target leaf gracefully`() {
        // Arrange
        val leaves = mapOf(
            "a.Foo" to DcLeaf(
                id = "a.Foo",
                name = "Foo",
                physicalPath = "src/Foo.ts",
                nodeType = "CLASS",
                language = "TypeScript",
                dependencies = mapOf(
                    "nonexistent.Bar" to DcDependency(weight = 1, type = "usage")
                )
            )
        )
        val project = DcProject(leaves = leaves)

        // Act
        val edges = DcJsonParser.parseEdges(project)

        // Assert
        assertThat(edges).isEmpty()
    }

    @Test
    fun `should create edges in both directions`() {
        // Arrange
        val leaves = mapOf(
            "a.Foo" to DcLeaf(
                id = "a.Foo",
                name = "Foo",
                physicalPath = "src/Foo.ts",
                nodeType = "CLASS",
                language = "TypeScript",
                dependencies = mapOf(
                    "b.Bar" to DcDependency(weight = 1, type = "usage")
                )
            ),
            "b.Bar" to DcLeaf(
                id = "b.Bar",
                name = "Bar",
                physicalPath = "src/Bar.ts",
                nodeType = "CLASS",
                language = "TypeScript",
                dependencies = mapOf(
                    "a.Foo" to DcDependency(weight = 1, type = "usage")
                )
            )
        )
        val project = DcProject(leaves = leaves)

        // Act
        val edges = DcJsonParser.parseEdges(project)

        // Assert
        assertThat(edges).hasSize(2)
        val fromNames = edges.map { it.fromNodeName }
        val toNames = edges.map { it.toNodeName }
        assertThat(fromNames).containsExactlyInAnyOrder("/root/src/Foo.ts", "/root/src/Bar.ts")
        assertThat(toNames).containsExactlyInAnyOrder("/root/src/Bar.ts", "/root/src/Foo.ts")
    }

    @Test
    fun `should handle empty leaves map`() {
        // Arrange
        val project = DcProject(leaves = emptyMap())

        // Act
        val edges = DcJsonParser.parseEdges(project)

        // Assert
        assertThat(edges).isEmpty()
    }
}
