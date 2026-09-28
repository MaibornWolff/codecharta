package de.maibornwolff.codecharta.analysers.parsers.dependency.processing.levelization

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Node
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.NodeType
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class GraphConverterKtTest {
    @Test
    fun `should create correct tree out of flat nodes`() {
        // Arrange
        val nodes = listOf<Node>(
            createNode("de", "maibornwolff", "class"),
            createNode("de", "maibornwolff", "otherClass"),
            createNode("de", "deutschebahn")
        )

        // Act
        val graphNodes = nodes.toGraphNodes()

        // Assert
        assertThat(graphNodes.map { it.id }).containsExactlyInAnyOrder("de")
        val de = graphNodes.find { it.id == "de" }
        assertThat(de?.children?.map { it.id }).containsExactlyInAnyOrder("de.maibornwolff", "de.deutschebahn")
        val deMb = de?.children?.find { it.id == "de.maibornwolff" }
        assertThat(deMb?.children?.map { it.id }).containsExactlyInAnyOrder("de.maibornwolff.class", "de.maibornwolff.otherClass")
        val deDb = de?.children?.find { it.id == "de.deutschebahn" }
        assertThat(deDb?.children).isEmpty()
    }

    @Test
    fun `should handle empty list of nodes`() {
        // Arrange
        val nodes = emptyList<Node>()

        // Act
        val graphNodes = nodes.toGraphNodes()

        // Assert
        assertThat(graphNodes).isEmpty()
    }

    @Test
    fun `should handle single node`() {
        // Arrange
        val nodes = listOf(createNode("de"))

        // Act
        val graphNodes = nodes.toGraphNodes()

        // Assert
        assertThat(graphNodes.map { it.id }).containsExactly("de")
        assertThat(graphNodes.find { it.id == "de" }?.children).isEmpty()
    }

    private fun createNode(vararg parts: String): Node = Node(
        pathWithName = Path(parts.toList()),
        physicalPath = parts.joinToString("."),
        nodeType = NodeType.CLASS,
        language = SupportedLanguage.JAVA,
        dependencies = emptySet(),
        usedTypes = emptySet()
    )
}
