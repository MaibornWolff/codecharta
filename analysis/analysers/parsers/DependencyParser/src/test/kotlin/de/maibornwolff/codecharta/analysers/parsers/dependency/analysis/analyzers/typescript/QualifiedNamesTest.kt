package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.typescript

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Node
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.NodeType
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Type
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
import de.maibornwolff.treesitter.excavationsite.api.UsedType
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class QualifiedNamesTest {
    private val filePath = Path(listOf("src", "geo"))

    private fun node(name: String, vararg usedTypes: String) = Node(
        pathWithName = filePath + name,
        physicalPath = "src/geo.ts",
        nodeType = NodeType.CLASS,
        language = SupportedLanguage.TYPESCRIPT,
        dependencies = emptySet(),
        usedTypes = usedTypes.map { Type.simple(it) }.toSet()
    )

    @Test
    fun `should write a qualified name that starts with an own declaration below the file, its prefixes as fallbacks`() {
        // Arrange
        val qualifiedNames = QualifiedNames(filePath)
        qualifiedNames.remember(setOf(UsedType("Shapes.Circle")))

        // Act
        val nodes = qualifiedNames.resolvedIn(listOf(node("Shapes"), node("Draw", "Shapes.Circle")))

        // Assert
        val use = nodes.single { it.name() == "Draw" }.usedTypes.single()
        assertThat(use.name).isEqualTo("src.geo.Shapes.Circle")
        assertThat(use.fallbacks.map { it.name }).containsExactly("src.geo.Shapes")
    }

    @Test
    fun `should keep a qualified name of another module as written, its prefixes as fallbacks`() {
        // Arrange
        val qualifiedNames = QualifiedNames(filePath)
        qualifiedNames.remember(setOf(UsedType("Color.Red")))

        // Act
        val nodes = qualifiedNames.resolvedIn(listOf(node("Paint", "Color.Red", "Other")))

        // Assert
        val uses = nodes.single().usedTypes.associate { it.name to it.fallbacks.map { fallback -> fallback.name } }
        assertThat(uses).containsExactlyInAnyOrderEntriesOf(mapOf("Color.Red" to listOf("Color"), "Other" to emptyList()))
    }
}
