package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.typescript

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Node
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.NodeType
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Type
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class OwnNamesTest {
    private val modulePath = Path(listOf("src", "geo"))

    private fun node(path: List<String>, vararg usedTypes: String, nodeType: NodeType = NodeType.CLASS) = Node(
        pathWithName = Path(path),
        physicalPath = "src/geo.ts",
        nodeType = nodeType,
        language = SupportedLanguage.TYPESCRIPT,
        dependencies = emptySet(),
        usedTypes = usedTypes.map { Type.simple(it) }.toSet()
    )

    private fun usesOf(nodes: List<Node>, name: String) = nodes.single { it.name() == name }.usedTypes.map { it.name }

    @Test
    fun `should write a name of a top-level declaration of the module as its full path`() {
        // Arrange
        val nodes = listOf(node(listOf("src", "geo", "Point")), node(listOf("src", "geo", "draw"), "Point", "Other"))

        // Act
        val written = OwnNames.writtenInFull(nodes, modulePath)

        // Assert
        assertThat(usesOf(written, "draw")).containsExactly("src.geo.Point", "Other")
    }

    @Test
    fun `should write a name a namespace around the use declares before a top-level one`() {
        // Arrange
        val nodes = listOf(
            node(listOf("src", "geo", "Point")),
            node(listOf("src", "geo", "Size")),
            node(listOf("src", "geo", "Shapes", "Point")),
            node(listOf("src", "geo", "Shapes", "Circle"), "Point", "Size")
        )

        // Act
        val written = OwnNames.writtenInFull(nodes, modulePath)

        // Assert
        assertThat(usesOf(written, "Circle")).containsExactly("src.geo.Shapes.Point", "src.geo.Size")
    }

    @Test
    fun `should keep a name as written that only a re-export of the module declares`() {
        // Arrange
        val nodes = listOf(
            node(listOf("src", "geo", "Point"), nodeType = NodeType.REEXPORT),
            node(listOf("src", "geo", "draw"), "Point")
        )

        // Act
        val written = OwnNames.writtenInFull(nodes, modulePath)

        // Assert
        assertThat(usesOf(written, "draw")).containsExactly("Point")
    }

    @Test
    fun `should write a name a declare module block declares as the path of that block`() {
        // Arrange
        val nodes = listOf(node(listOf("legacy-lib", "Base")), node(listOf("legacy-lib", "Api"), "Base"))

        // Act
        val written = OwnNames.writtenInFull(nodes, modulePath)

        // Assert
        assertThat(usesOf(written, "Api")).containsExactly("legacy-lib.Base")
    }

    @Test
    fun `should write a name a Vue component uses in the module whose path the component has`() {
        // Arrange
        val nodes = listOf(node(listOf("src", "geo"), "Point"), node(listOf("src", "geo", "Point")))

        // Act
        val written = OwnNames.writtenInFull(nodes, modulePath)

        // Assert
        assertThat(usesOf(written, "geo")).containsExactly("src.geo.Point")
    }
}
